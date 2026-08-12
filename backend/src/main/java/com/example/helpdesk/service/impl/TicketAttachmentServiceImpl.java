package com.example.helpdesk.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import java.io.IOException;

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
    @Transactional
    public TicketAttachmentResponseDTO uploadTicketAttachment(Long ticketId, Long uploadedById, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        User user = userRepository.findById(uploadedById)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        TicketAttachment attachment = new TicketAttachment();
        attachment.setFileName(file.getOriginalFilename() == null ? "attachment" : file.getOriginalFilename());
        attachment.setFilePath("/api/ticket-attachments/download/");
        attachment.setFileSize(file.getSize());
        attachment.setContentType(file.getContentType());
        try {
            attachment.setFileData(file.getBytes());
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to read attachment", exception);
        }
        attachment.setUploadedAt(LocalDateTime.now());
        attachment.setTicket(ticket);
        attachment.setUploadedBy(user);
        TicketAttachment saved = ticketAttachmentRepository.save(attachment);
        saved.setFilePath("/api/ticket-attachments/" + saved.getId() + "/download");
        return mapToResponseDTO(ticketAttachmentRepository.save(saved));
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] getAttachmentData(Long id) {
        TicketAttachment attachment = findAttachment(id);
        if (attachment.getFileData() == null) throw new ResourceNotFoundException("Attachment file data not found");
        return attachment.getFileData();
    }

    @Override
    @Transactional(readOnly = true)
    public String getAttachmentContentType(Long id) {
        String contentType = findAttachment(id).getContentType();
        return contentType == null || contentType.isBlank() ? "application/octet-stream" : contentType;
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

    private TicketAttachment findAttachment(Long id) {
        return ticketAttachmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket Attachment not found"));
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
                attachment.getUploadedBy().getId(),
                attachment.getUploadedBy().getFirstName() + " " + attachment.getUploadedBy().getLastName()
        );
    }
}
