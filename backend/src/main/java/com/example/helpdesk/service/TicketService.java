package com.example.helpdesk.service;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.helpdesk.dto.TicketAssignmentHistoryResponseDTO;
import com.example.helpdesk.dto.TicketAssigneeOptionDTO;
import com.example.helpdesk.dto.TicketCreateDTO;
import com.example.helpdesk.dto.TicketResponseDTO;
import com.example.helpdesk.dto.TicketStatusHistoryResponseDTO;
import com.example.helpdesk.dto.TicketUpdateDTO;
import com.example.helpdesk.model.TicketStatus;
import com.example.helpdesk.model.TicketPriority;

public interface TicketService {

    TicketResponseDTO create(TicketCreateDTO ticketCreateDTO);

    TicketResponseDTO getById(Long id);

    List<TicketResponseDTO> getAll();

    List<TicketResponseDTO> getAll(TicketStatus status, String category, TicketPriority priority);
    Page<TicketResponseDTO> getAll(TicketStatus status, String category, TicketPriority priority, Pageable pageable);

    Page<TicketResponseDTO> getCreatedTicketsForCurrentUser(TicketStatus status, String category, TicketPriority priority, Pageable pageable);
    Page<TicketResponseDTO> getAssignedTicketsForCurrentUser(TicketStatus status, String category, TicketPriority priority, Pageable pageable);

    TicketResponseDTO update(Long id, TicketUpdateDTO ticketUpdateDTO);

    TicketResponseDTO updateAssignment(Long ticketId, Long assigneeId);

    List<TicketAssigneeOptionDTO> getAssignmentCandidates(Long ticketId);

    TicketResponseDTO rejectAssignedTicket(Long ticketId);

    void delete(Long id);

    TicketResponseDTO assignTicket(Long ticketId, Long assigneeId, Long assignedById);

    TicketResponseDTO changeStatus(Long ticketId, TicketStatus newStatus, Long changedById);

    List<TicketResponseDTO> getTicketsByCreator(Long creatorId); 

    List<TicketResponseDTO> getTicketsByAssignee(Long assigneeId);

    List<TicketAssignmentHistoryResponseDTO> getAssignmentHistory(Long ticketId);

    List<TicketStatusHistoryResponseDTO> getStatusHistory(Long ticketId);
}
