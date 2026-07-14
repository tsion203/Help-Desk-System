package com.example.helpdesk.service;

import java.util.List;

import com.example.helpdesk.dto.TicketCommentCreateDTO;
import com.example.helpdesk.dto.TicketCommentResponseDTO;

public interface TicketCommentService {

    TicketCommentResponseDTO create(TicketCommentCreateDTO ticketCommentCreateDTO);

    TicketCommentResponseDTO getById(Long id);

    List<TicketCommentResponseDTO> getAll();

    TicketCommentResponseDTO update(Long id, TicketCommentCreateDTO ticketCommentCreateDTO);

    void delete(Long id);
}
