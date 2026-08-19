package com.example.helpdesk.dto;

import java.time.LocalDateTime;

import com.example.helpdesk.model.TicketPriority;
import com.example.helpdesk.model.TicketStatus;

public record DashboardTicketActivityDTO(
        Long id,
        String ticketNumber,
        String subject,
        TicketStatus status,
        TicketPriority priority,
        LocalDateTime updatedAt) {
}
