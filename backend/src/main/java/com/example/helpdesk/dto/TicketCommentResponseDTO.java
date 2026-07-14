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
public class TicketCommentResponseDTO {

    private Long id;

    private String comment;

    private LocalDateTime commentedAt;

    private Long ticketId;

    private Long userId;

    private String userName;
}
