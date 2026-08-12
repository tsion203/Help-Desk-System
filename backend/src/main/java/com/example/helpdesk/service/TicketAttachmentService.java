package com.example.helpdesk.service;

import java.util.List;

import com.example.helpdesk.dto.TicketAttachmentCreateDTO;
import com.example.helpdesk.dto.TicketAttachmentResponseDTO;
import org.springframework.web.multipart.MultipartFile;

public interface TicketAttachmentService {

    TicketAttachmentResponseDTO createTicketAttachment(
            TicketAttachmentCreateDTO createDTO);

    TicketAttachmentResponseDTO uploadTicketAttachment(Long ticketId, Long uploadedById, MultipartFile file);

    byte[] getAttachmentData(Long id);

    String getAttachmentContentType(Long id);

    List<TicketAttachmentResponseDTO> getAllTicketAttachments();

    TicketAttachmentResponseDTO getTicketAttachmentById(Long id);

    TicketAttachmentResponseDTO updateTicketAttachment(
            Long id,
            TicketAttachmentCreateDTO updateDTO);

    void deleteTicketAttachment(Long id);
}
