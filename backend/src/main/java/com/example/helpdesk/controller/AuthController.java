package com.example.helpdesk.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.helpdesk.dto.LoginRequestDTO;
import com.example.helpdesk.dto.LoginResponseDTO;
import com.example.helpdesk.dto.ForgotPasswordRequestDTO;
import com.example.helpdesk.dto.RegisterRequestDTO;
import com.example.helpdesk.dto.ResetPasswordRequestDTO;
import com.example.helpdesk.exception.ConflictException;
import com.example.helpdesk.model.Department;
import com.example.helpdesk.model.Role;
import com.example.helpdesk.model.User;
import com.example.helpdesk.repository.DepartmentRepository;
import com.example.helpdesk.repository.RoleRepository;
import com.example.helpdesk.repository.UserRepository;
import com.example.helpdesk.security.JwtUtil;
import com.example.helpdesk.service.PasswordResetTokenService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenService passwordResetTokenService;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtUtil jwtUtil,
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            PasswordResetTokenService passwordResetTokenService
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordResetTokenService = passwordResetTokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequestDTO) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequestDTO.getEmail(), loginRequestDTO.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(authority -> authority.getAuthority().replaceFirst("^ROLE_", ""))
                .toList();
        String token = jwtUtil.generateToken(userDetails.getUsername(), roles);

        LoginResponseDTO responseDTO = new LoginResponseDTO(token, "Bearer", userDetails.getUsername(), primaryRole(roles));
        return ResponseEntity.ok(responseDTO);
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponseDTO> register(@Valid @RequestBody RegisterRequestDTO registerRequestDTO) {
        if (userRepository.existsByEmailIgnoreCase(registerRequestDTO.getEmail()))
            throw new ConflictException("An account with this email already exists.");
        if (userRepository.existsByEmployeeId(registerRequestDTO.getEmployeeId()))
            throw new ConflictException("Employee ID already exists.");

        User user = new User();
        user.setEmail(registerRequestDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequestDTO.getPassword()));
        user.setEmployeeId(registerRequestDTO.getEmployeeId());
        user.setFirstName(registerRequestDTO.getFirstName());
        user.setLastName(registerRequestDTO.getLastName());
        user.setPhoneNumber(registerRequestDTO.getPhoneNumber());
        user.setActive(Boolean.TRUE.equals(registerRequestDTO.getActive()));

        if (registerRequestDTO.getDepartmentId() != null) {
            Department department = departmentRepository.findById(registerRequestDTO.getDepartmentId())
                    .orElseThrow(() -> new IllegalArgumentException("Department not found"));
            if (!department.isActive()) throw new ConflictException("This department is currently inactive and cannot be selected.");
            user.setDepartment(department);
        }

        Role employeeRole = roleRepository.findAll().stream()
                .filter(role -> "EMPLOYEE".equals(role.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("EMPLOYEE role is not configured"));
        if (!employeeRole.isActive()) throw new ConflictException("This role is currently inactive and cannot be selected.");
        user.setRoles(List.of(employeeRole));

        userRepository.save(user);
        List<String> roleNames = user.getRoles() == null ? List.of() : user.getRoles().stream()
                .map(Role::getName).map(this::normalizeRoleName).toList();
        String token = jwtUtil.generateToken(user.getEmail(), roleNames);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new LoginResponseDTO(token, "Bearer", user.getEmail(), primaryRole(roleNames)));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequestDTO request) {
        passwordResetTokenService.requestPasswordReset(request);
        return ResponseEntity.ok("If an account exists for that email, a password reset link has been sent.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @Valid @RequestBody ResetPasswordRequestDTO request) {
        passwordResetTokenService.resetPassword(request);
        return ResponseEntity.ok("Password reset successfully.");
    }

    private String primaryRole(List<String> roles) {
        return roles == null || roles.isEmpty() ? null : normalizeRoleName(roles.get(0));
    }

    private String normalizeRoleName(String role) {
        return role == null ? null : role.trim().toUpperCase().replace(' ', '_').replace('-', '_').replaceFirst("^ROLE_", "");
    }
}
