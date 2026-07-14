package com.example.helpdesk.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.example.helpdesk.model.TicketPriority;
import com.example.helpdesk.model.TicketStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponseDTO {

    private Long id;

    private String ticketNumber;

    private String subject;

    private String description;

    private TicketStatus status;

    private TicketPriority priority;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime resolvedAt;

    private Long createdById;

    private String createdByName;

    private Long assignedToId;

    private String assignedToName;

    private Long categoryId;

    private String categoryName;

    private List<TicketCommentResponseDTO> comments;

    private List<TicketAttachmentResponseDTO> attachments;

    private List<TicketStatusHistoryResponseDTO> statusHistory;

    private List<TicketAssignmentHistoryResponseDTO> assignmentHistory;
}
