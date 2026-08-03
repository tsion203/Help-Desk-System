package com.example.helpdesk.service;

import com.example.helpdesk.dto.ForgotPasswordRequestDTO;
import com.example.helpdesk.dto.ResetPasswordRequestDTO;

public interface PasswordResetTokenService {
    void requestPasswordReset(ForgotPasswordRequestDTO request);
    void resetPassword(ResetPasswordRequestDTO request);
}
