package com.example.helpdesk.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.helpdesk.dto.TicketStatusHistoryResponseDTO;
import com.example.helpdesk.service.TicketService;

@RestController
@RequestMapping("/api/ticket-status-history")
public class TicketStatusHistoryController {

    private final TicketService ticketService;

    public TicketStatusHistoryController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping("/ticket/{ticketId}")
    public List<TicketStatusHistoryResponseDTO> getAssignmentHistory(
            @PathVariable Long ticketId) {

        return ticketService.getStatusHistory(ticketId);
    }
}