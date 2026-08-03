package com.example.helpdesk.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.helpdesk.dto.TicketCreateDTO;
import com.example.helpdesk.dto.TicketResponseDTO;
import com.example.helpdesk.dto.TicketUpdateDTO;
import com.example.helpdesk.service.TicketService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<TicketResponseDTO> createTicket(@Valid @RequestBody TicketCreateDTO ticketCreateDTO) {
        TicketResponseDTO createdTicket = ticketService.create(ticketCreateDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTicket);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISOR','SUPPORT_OFFICER','EMPLOYEE')")
    public ResponseEntity<List<TicketResponseDTO>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("@rbac.canAccessTicket(#id, authentication)")
    public ResponseEntity<TicketResponseDTO> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@rbac.canUpdateTicket(#id, authentication)")
    public ResponseEntity<TicketResponseDTO> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketUpdateDTO ticketUpdateDTO
    ) {
        return ResponseEntity.ok(ticketService.update(id, ticketUpdateDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@rbac.canDeleteTicket(#id, authentication)")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
