package com.example.helpdesk.dto;

import jakarta.validation.constraints.NotBlank;

public record ResendRegistrationDTO(@NotBlank String registrationId) {}
