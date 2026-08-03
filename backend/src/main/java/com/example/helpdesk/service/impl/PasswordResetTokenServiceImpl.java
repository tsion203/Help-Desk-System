package com.example.helpdesk.service.impl;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.helpdesk.dto.ForgotPasswordRequestDTO;
import com.example.helpdesk.dto.ResetPasswordRequestDTO;
import com.example.helpdesk.exception.PasswordResetException;
import com.example.helpdesk.model.PasswordResetToken;
import com.example.helpdesk.model.User;
import com.example.helpdesk.repository.PasswordResetTokenRepository;
import com.example.helpdesk.repository.UserRepository;
import com.example.helpdesk.service.EmailService;
import com.example.helpdesk.service.PasswordResetTokenService;

@Service
public class PasswordResetTokenServiceImpl implements PasswordResetTokenService {
    private static final long EXPIRY_MINUTES = 15;

    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final String frontendUrl;

    public PasswordResetTokenServiceImpl(
            PasswordResetTokenRepository tokenRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            @Value("${app.frontend-url:http://localhost:4200}") String frontendUrl) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
    }

    @Override
    @Transactional
    public void requestPasswordReset(ForgotPasswordRequestDTO request) {
        userRepository.findByEmail(request.getEmail().trim()).ifPresent(user -> {
            tokenRepository.findAllByUserAndUsedFalse(user).forEach(token -> token.setUsed(true));

            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setToken(UUID.randomUUID().toString());
            resetToken.setUser(user);
            resetToken.setExpiryDateTime(LocalDateTime.now().plusMinutes(EXPIRY_MINUTES));
            resetToken.setUsed(false);
            tokenRepository.save(resetToken);

            String resetLink = frontendUrl + "/reset-password?token=" + resetToken.getToken();
            emailService.sendPasswordReset(user, resetLink, EXPIRY_MINUTES);
        });
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequestDTO request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new PasswordResetException("Passwords do not match");
        }

        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new PasswordResetException("Invalid password reset token"));
        if (resetToken.isUsed()) {
            throw new PasswordResetException("This password reset link has already been used");
        }
        if (resetToken.getExpiryDateTime().isBefore(LocalDateTime.now())) {
            throw new PasswordResetException("This password reset link has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }
}
