package com.example.helpdesk.service;

import java.util.List;

import com.example.helpdesk.dto.TicketCreateDTO;
import com.example.helpdesk.dto.TicketResponseDTO;
import com.example.helpdesk.dto.TicketUpdateDTO;
import com.example.helpdesk.model.TicketStatus;

public interface TicketService {

    TicketResponseDTO create(TicketCreateDTO ticketCreateDTO);

    TicketResponseDTO getById(Long id);

    List<TicketResponseDTO> getAll();

    TicketResponseDTO update(Long id, TicketUpdateDTO ticketUpdateDTO);

    void delete(Long id);

    TicketResponseDTO assignTicket(Long ticketId, Long assigneeId, Long assignedById);

    TicketResponseDTO changeStatus(Long ticketId, TicketStatus newStatus, Long changedById);

    List<TicketResponseDTO> getTicketsByCreator(Long creatorId);

    List<TicketResponseDTO> getTicketsByAssignee(Long assigneeId);
}
