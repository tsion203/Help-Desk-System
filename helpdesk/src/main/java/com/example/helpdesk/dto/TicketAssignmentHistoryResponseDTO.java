package com.example.helpdesk.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TicketAssignmentHistoryResponseDTO {

    private Long id;

    private Long ticketId;

    private Long oldAssigneeId;

    private String oldAssigneeName;

    private Long newAssigneeId;

    private String newAssigneeName;

    private Long assignedById;

    private String assignedByName;

    private LocalDateTime assignedAt;
}
