package com.example.helpdesk.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.helpdesk.dto.TicketAssignmentHistoryResponseDTO;
import com.example.helpdesk.service.TicketService;

@RestController
@RequestMapping("/api/ticket-assignment-history")
public class TicketAssignmentHistoryController {

    private final TicketService ticketService;

    public TicketAssignmentHistoryController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping("/ticket/{ticketId}")
    public List<TicketAssignmentHistoryResponseDTO> getAssignmentHistory(
            @PathVariable Long ticketId) {

        return ticketService.getAssignmentHistory(ticketId);
    }
}