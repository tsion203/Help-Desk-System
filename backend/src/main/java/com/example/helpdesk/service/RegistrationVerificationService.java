package com.example.helpdesk.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.helpdesk.dto.*;
import com.example.helpdesk.exception.*;
import com.example.helpdesk.model.*;
import com.example.helpdesk.repository.*;

@Service
public class RegistrationVerificationService {
    private final RegistrationVerificationRepository verifications;
    private final UserRepository users;
    private final DepartmentRepository departments;
    private final RoleRepository roles;
    private final PasswordEncoder encoder;
    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();

    public RegistrationVerificationService(RegistrationVerificationRepository verifications, UserRepository users,
            DepartmentRepository departments, RoleRepository roles, PasswordEncoder encoder, EmailService emailService) {
        this.verifications = verifications;
        this.users = users;
        this.departments = departments;
        this.roles = roles;
        this.encoder = encoder;
        this.emailService = emailService;
    }

    @Transactional
    public RegistrationChallengeDTO start(RegisterRequestDTO request) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        checkUnique(email, request.getEmployeeId());
        department(request.getDepartmentId());
        employeeRole();
        RegistrationVerification pending = verifications.lockByEmail(email).orElseGet(() -> {
            RegistrationVerification created = new RegistrationVerification();
            created.setId(UUID.randomUUID().toString());
            created.setEmail(email);
            return created;
        });
        checkSendLimit(pending);
        // A repeated registration must not silently replace the details bound to a live code.
        if (pending.getExpiresAt() != null && pending.getExpiresAt().isAfter(Instant.now())) {
            throw invalid("Verification is already pending. Enter your code or use Resend Code.");
        }
        pending.setPasswordHash(encoder.encode(request.getPassword()));
        pending.setEmployeeId(request.getEmployeeId());
        pending.setFirstName(request.getFirstName());
        pending.setLastName(request.getLastName());
        pending.setPhoneNumber(request.getPhoneNumber());
        pending.setDepartmentId(request.getDepartmentId());
        pending.setActive(Boolean.TRUE.equals(request.getActive()));
        pending.setUsed(false);
        return sendCode(pending);
    }

    @Transactional
    public RegistrationChallengeDTO resend(String id) {
        RegistrationVerification pending = find(id);
        checkUnused(pending);
        checkUnique(pending.getEmail(), pending.getEmployeeId());
        checkSendLimit(pending);
        return sendCode(pending);
    }

    // Incorrect attempts must commit so the attempt limit survives failed requests.
    @Transactional(noRollbackFor = RegistrationVerificationException.class)
    public User verify(VerifyRegistrationDTO request) {
        RegistrationVerification pending = find(request.registrationId());
        checkUnused(pending);
        if (!pending.getExpiresAt().isAfter(Instant.now())) {
            throw invalid("This verification code has expired. Please request a new code.");
        }
        if (pending.getFailedAttempts() >= 5) {
            throw limited("Too many incorrect attempts. Please request a new code.");
        }
        if (!encoder.matches(request.code(), pending.getCodeHash())) {
            pending.setFailedAttempts(pending.getFailedAttempts() + 1);
            throw invalid("The verification code is incorrect. Please try again.");
        }
        checkUnique(pending.getEmail(), pending.getEmployeeId());
        User user = new User();
        user.setEmail(pending.getEmail());
        user.setPassword(pending.getPasswordHash());
        user.setEmployeeId(pending.getEmployeeId());
        user.setFirstName(pending.getFirstName());
        user.setLastName(pending.getLastName());
        user.setPhoneNumber(pending.getPhoneNumber());
        user.setActive(pending.isActive());
        user.setDepartment(department(pending.getDepartmentId()));
        user.setRoles(List.of(employeeRole()));
        users.saveAndFlush(user);
        pending.setUsed(true);
        pending.setCodeHash(null);
        pending.setPasswordHash(null);
        pending.setEmployeeId(null);
        pending.setFirstName(null);
        pending.setLastName(null);
        pending.setPhoneNumber(null);
        pending.setDepartmentId(null);
        return user;
    }

    private RegistrationChallengeDTO sendCode(RegistrationVerification pending) {
        Instant now = Instant.now();
        if (pending.getSendWindowStartedAt() == null || !pending.getSendWindowStartedAt().plus(1, ChronoUnit.HOURS).isAfter(now)) {
            pending.setSendWindowStartedAt(now);
            pending.setSendCount(0);
        }
        String code = String.format(Locale.ROOT, "%06d", random.nextInt(1_000_000));
        pending.setCodeHash(encoder.encode(code));
        pending.setExpiresAt(now.plus(10, ChronoUnit.MINUTES));
        pending.setLastSentAt(now);
        pending.setSendCount(pending.getSendCount() + 1);
        pending.setFailedAttempts(0);
        verifications.saveAndFlush(pending);
        // Synchronous delivery: a mail failure rolls back the new challenge.
        emailService.sendRegistrationVerification(pending.getEmail(), code);
        return new RegistrationChallengeDTO(pending.getId(), pending.getExpiresAt(), now.plusSeconds(60));
    }

    private void checkSendLimit(RegistrationVerification pending) {
        Instant now = Instant.now();
        if (pending.getLastSentAt() != null && pending.getLastSentAt().plusSeconds(60).isAfter(now)) {
            throw limited("Please wait 60 seconds between verification emails.");
        }
        if (pending.getSendWindowStartedAt() != null && pending.getSendWindowStartedAt().plus(1, ChronoUnit.HOURS).isAfter(now)
                && pending.getSendCount() >= 5) {
            throw limited("Too many verification emails requested. Please try again in an hour.");
        }
    }

    private RegistrationVerification find(String id) {
        return verifications.lockById(id).orElseThrow(() -> invalid("This verification request is invalid. Please register again."));
    }
    private void checkUnused(RegistrationVerification pending) {
        if (pending.isUsed()) throw invalid("This verification code has already been used. Please sign in.");
    }
    private void checkUnique(String email, String employeeId) {
        if (users.existsByEmailIgnoreCase(email)) throw new ConflictException("An account with this email already exists.");
        if (users.existsByEmployeeId(employeeId)) throw new ConflictException("Employee ID already exists.");
    }
    private Department department(Long id) {
        Department department = departments.findById(id).orElseThrow(() -> new ConflictException("Department not found."));
        if (!department.isActive()) throw new ConflictException("This department is currently inactive and cannot be selected.");
        return department;
    }
    private Role employeeRole() {
        Role role = roles.findAll().stream().filter(item -> item.getName() != null)
                .filter(item -> "EMPLOYEE".equals(item.getName().trim().toUpperCase(Locale.ROOT)
                        .replace(' ', '_').replace('-', '_').replaceFirst("^ROLE_", ""))).findFirst()
                .orElseThrow(() -> new IllegalStateException("EMPLOYEE role is not configured"));
        if (!role.isActive()) throw new ConflictException("This role is currently inactive and cannot be selected.");
        return role;
    }
    private RegistrationVerificationException invalid(String message) {
        return new RegistrationVerificationException(HttpStatus.BAD_REQUEST, message);
    }
    private RegistrationVerificationException limited(String message) {
        return new RegistrationVerificationException(HttpStatus.TOO_MANY_REQUESTS, message);
    }
}
