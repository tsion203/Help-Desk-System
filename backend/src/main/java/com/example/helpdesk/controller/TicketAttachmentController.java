package com.example.helpdesk.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
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
    @PreAuthorize("@rbac.canAccessTicket(#createDTO.ticketId, authentication)")
    @ResponseStatus(HttpStatus.CREATED)
    public TicketAttachmentResponseDTO createTicketAttachment(
            @Valid @RequestBody TicketAttachmentCreateDTO createDTO) {

        return ticketAttachmentService.createTicketAttachment(createDTO);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("@rbac.canAccessTicket(#ticketId, authentication) and @rbac.isCurrentUser(#uploadedById, authentication)")
    @ResponseStatus(HttpStatus.CREATED)
    public TicketAttachmentResponseDTO uploadTicketAttachment(
            @RequestParam Long ticketId,
            @RequestParam Long uploadedById,
            @RequestParam MultipartFile file) {
        return ticketAttachmentService.uploadTicketAttachment(ticketId, uploadedById, file);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISOR')")
    public List<TicketAttachmentResponseDTO> getAllTicketAttachments() {

        return ticketAttachmentService.getAllTicketAttachments();
    }

    @GetMapping("/{id}")
    @PreAuthorize("@rbac.canAccessAttachment(#id, authentication)")
    public TicketAttachmentResponseDTO getTicketAttachmentById(
            @PathVariable Long id) {

        return ticketAttachmentService.getTicketAttachmentById(id);
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("@rbac.canAccessAttachment(#id, authentication)")
    public ResponseEntity<byte[]> downloadTicketAttachment(@PathVariable Long id) {
        TicketAttachmentResponseDTO attachment = ticketAttachmentService.getTicketAttachmentById(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(ticketAttachmentService.getAttachmentContentType(id)))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFileName().replace("\"", "") + "\"")
                .body(ticketAttachmentService.getAttachmentData(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public TicketAttachmentResponseDTO updateTicketAttachment(
            @PathVariable Long id,
            @Valid @RequestBody TicketAttachmentCreateDTO updateDTO) {

        return ticketAttachmentService.updateTicketAttachment(id, updateDTO);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@rbac.canDeleteAttachment(#id, authentication)")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTicketAttachment(
            @PathVariable Long id) {

        ticketAttachmentService.deleteTicketAttachment(id);
    }
}
