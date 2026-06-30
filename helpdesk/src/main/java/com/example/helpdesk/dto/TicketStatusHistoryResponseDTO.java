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
public class TicketStatusHistoryResponseDTO {

    private Long id;

    private Long ticketId;

    private String oldStatus;

    private String newStatus;

    private Long changedById;

    private String changedByName;

    private LocalDateTime changedAt;
}
