package com.example.helpdesk.dto;

import java.util.List;
import java.util.Map;

import com.example.helpdesk.model.TicketPriority;
import com.example.helpdesk.model.TicketStatus;

public record DashboardResponseDTO(
        long totalTickets,
        Map<TicketStatus, Long> statusCounts,
        Map<TicketPriority, Long> priorityCounts,
        List<DashboardTicketActivityDTO> recentActivity,
        List<SupportOfficerOverviewDTO> supportOfficers) {
}
