package com.example.helpdesk.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.helpdesk.dto.TicketCommentCreateDTO;
import com.example.helpdesk.dto.TicketCommentResponseDTO;
import com.example.helpdesk.service.TicketCommentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/comments")
public class TicketCommentController {

    private final TicketCommentService ticketCommentService;

    public TicketCommentController(TicketCommentService ticketCommentService) {
        this.ticketCommentService = ticketCommentService;
    }

    @PostMapping
    public ResponseEntity<TicketCommentResponseDTO> createComment(
            @Valid @RequestBody TicketCommentCreateDTO ticketCommentCreateDTO
    ) {
        TicketCommentResponseDTO createdComment = ticketCommentService.create(ticketCommentCreateDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
    }

    @GetMapping
    public ResponseEntity<List<TicketCommentResponseDTO>> getAllComments() {
        return ResponseEntity.ok(ticketCommentService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketCommentResponseDTO> getCommentById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketCommentService.getById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        ticketCommentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
