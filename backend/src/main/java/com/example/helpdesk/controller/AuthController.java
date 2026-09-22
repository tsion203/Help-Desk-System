package com.example.helpdesk.controller;

import java.util.List;
import com.example.helpdesk.dto.RegistrationChallengeDTO;
import com.example.helpdesk.dto.ResendRegistrationDTO;
import com.example.helpdesk.dto.VerifyRegistrationDTO;
import com.example.helpdesk.service.RegistrationVerificationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.helpdesk.dto.LoginRequestDTO;
import com.example.helpdesk.dto.LoginResponseDTO;
import com.example.helpdesk.dto.ForgotPasswordRequestDTO;
import com.example.helpdesk.dto.RegisterRequestDTO;
import com.example.helpdesk.dto.ResetPasswordRequestDTO;
import com.example.helpdesk.model.Role;
import com.example.helpdesk.model.User;
import com.example.helpdesk.security.JwtUtil;
import com.example.helpdesk.service.PasswordResetTokenService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final PasswordResetTokenService passwordResetTokenService;
    private final RegistrationVerificationService registrationVerificationService;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil,
            PasswordResetTokenService passwordResetTokenService, RegistrationVerificationService registrationVerificationService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.passwordResetTokenService = passwordResetTokenService;
        this.registrationVerificationService = registrationVerificationService;
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
    public ResponseEntity<RegistrationChallengeDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        return ResponseEntity.accepted().body(registrationVerificationService.start(request));
    }

    @PostMapping("/register/resend")
    public RegistrationChallengeDTO resendRegistration(@Valid @RequestBody ResendRegistrationDTO request) {
        return registrationVerificationService.resend(request.registrationId());
    }

    @PostMapping("/register/verify")
    public ResponseEntity<LoginResponseDTO> verifyRegistration(@Valid @RequestBody VerifyRegistrationDTO request) {
        User user = registrationVerificationService.verify(request);
        List<String> roleNames = user.getRoles().stream().map(Role::getName).map(this::normalizeRoleName).toList();
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
