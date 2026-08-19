package com.example.helpdesk.dto;

public record SupportOfficerOverviewDTO(
        Long id,
        String name,
        String email,
        long assigned,
        long inProgress,
        long pending,
        long resolved,
        long total) {
}
