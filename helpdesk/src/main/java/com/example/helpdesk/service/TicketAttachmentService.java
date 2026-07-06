package com.example.helpdesk.service;

import java.util.List;

import com.example.helpdesk.dto.TicketAttachmentCreateDTO;
import com.example.helpdesk.dto.TicketAttachmentResponseDTO;

public interface TicketAttachmentService {

    TicketAttachmentResponseDTO createTicketAttachment(
            TicketAttachmentCreateDTO createDTO);

    List<TicketAttachmentResponseDTO> getAllTicketAttachments();

    TicketAttachmentResponseDTO getTicketAttachmentById(Long id);

    TicketAttachmentResponseDTO updateTicketAttachment(
            Long id,
            TicketAttachmentCreateDTO updateDTO);

    void deleteTicketAttachment(Long id);
}