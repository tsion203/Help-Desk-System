package com.example.helpdesk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyRegistrationDTO(@NotBlank String registrationId,
        @NotBlank @Pattern(regexp = "[0-9]{6}", message = "Enter the six-digit verification code.") String code) {}
