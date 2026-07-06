package com.example.helpdesk.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.helpdesk.dto.TicketAttachmentCreateDTO;
import com.example.helpdesk.dto.TicketAttachmentResponseDTO;
import com.example.helpdesk.service.TicketAttachmentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/ticket-attachments")
public class TicketAttachmentController {

    private final TicketAttachmentService ticketAttachmentService;

    public TicketAttachmentController(TicketAttachmentService ticketAttachmentService) {
        this.ticketAttachmentService = ticketAttachmentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TicketAttachmentResponseDTO createTicketAttachment(
            @Valid @RequestBody TicketAttachmentCreateDTO createDTO) {

        return ticketAttachmentService.createTicketAttachment(createDTO);
    }

    @GetMapping
    public List<TicketAttachmentResponseDTO> getAllTicketAttachments() {

        return ticketAttachmentService.getAllTicketAttachments();
    }

    @GetMapping("/{id}")
    public TicketAttachmentResponseDTO getTicketAttachmentById(
            @PathVariable Long id) {

        return ticketAttachmentService.getTicketAttachmentById(id);
    }

    @PutMapping("/{id}")
    public TicketAttachmentResponseDTO updateTicketAttachment(
            @PathVariable Long id,
            @Valid @RequestBody TicketAttachmentCreateDTO updateDTO) {

        return ticketAttachmentService.updateTicketAttachment(id, updateDTO);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTicketAttachment(
            @PathVariable Long id) {

        ticketAttachmentService.deleteTicketAttachment(id);
    }
}