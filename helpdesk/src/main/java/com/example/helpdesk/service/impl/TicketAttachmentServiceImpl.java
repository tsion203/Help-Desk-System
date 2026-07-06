package com.example.helpdesk.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.helpdesk.dto.TicketAttachmentCreateDTO;
import com.example.helpdesk.dto.TicketAttachmentResponseDTO;
import com.example.helpdesk.exception.ResourceNotFoundException;
import com.example.helpdesk.model.Ticket;
import com.example.helpdesk.model.TicketAttachment;
import com.example.helpdesk.model.User;
import com.example.helpdesk.repository.TicketAttachmentRepository;
import com.example.helpdesk.repository.TicketRepository;
import com.example.helpdesk.repository.UserRepository;
import com.example.helpdesk.service.TicketAttachmentService;

import lombok.Getter;
import lombok.Setter;
@Getter
@Setter


@Service
public class TicketAttachmentServiceImpl implements TicketAttachmentService {

    private final TicketAttachmentRepository ticketAttachmentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketAttachmentServiceImpl(
            TicketAttachmentRepository ticketAttachmentRepository,
            TicketRepository ticketRepository,
            UserRepository userRepository) {

        this.ticketAttachmentRepository = ticketAttachmentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    @Override
    public TicketAttachmentResponseDTO createTicketAttachment(
            TicketAttachmentCreateDTO createDTO) {

        Ticket ticket = ticketRepository.findById(createDTO.getTicketId())
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        User user = userRepository.findById(createDTO.getUploadedById())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TicketAttachment attachment = new TicketAttachment();

        attachment.setFileName(createDTO.getFileName());
        attachment.setFilePath(createDTO.getFilePath());
        attachment.setFileSize(createDTO.getFileSize());
        attachment.setUploadedAt(LocalDateTime.now());
        attachment.setTicket(ticket);
        attachment.setUploadedBy(user);

        attachment = ticketAttachmentRepository.save(attachment);

        return mapToResponseDTO(attachment);
    }

    @Override
    public List<TicketAttachmentResponseDTO> getAllTicketAttachments() {

        return ticketAttachmentRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    @Override
    public TicketAttachmentResponseDTO getTicketAttachmentById(Long id) {

        TicketAttachment attachment = ticketAttachmentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Ticket Attachment not found"));

        return mapToResponseDTO(attachment);
    }

    @Override
    public TicketAttachmentResponseDTO updateTicketAttachment(
            Long id,
            TicketAttachmentCreateDTO updateDTO) {

        TicketAttachment attachment = ticketAttachmentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Ticket Attachment not found"));

        Ticket ticket = ticketRepository.findById(updateDTO.getTicketId())
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        User user = userRepository.findById(updateDTO.getUploadedById())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        attachment.setFileName(updateDTO.getFileName());
        attachment.setFilePath(updateDTO.getFilePath());
        attachment.setFileSize(updateDTO.getFileSize());
        attachment.setTicket(ticket);
        attachment.setUploadedBy(user);

        attachment = ticketAttachmentRepository.save(attachment);

        return mapToResponseDTO(attachment);
    }

    @Override
    public void deleteTicketAttachment(Long id) {

        TicketAttachment attachment = ticketAttachmentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Ticket Attachment not found"));

        ticketAttachmentRepository.delete(attachment);
    }

    private TicketAttachmentResponseDTO mapToResponseDTO(
            TicketAttachment attachment) {

        return new TicketAttachmentResponseDTO(
                attachment.getId(),
                attachment.getFileName(),
                attachment.getFilePath(),
                attachment.getFileSize(),
                attachment.getUploadedAt(),
                attachment.getTicket().getId(),
                attachment.getUploadedBy().getId()
        );
    }
}