package com.example.helpdesk.dto;

import java.time.Instant;

public record RegistrationChallengeDTO(String registrationId, Instant expiresAt, Instant resendAvailableAt) {}
