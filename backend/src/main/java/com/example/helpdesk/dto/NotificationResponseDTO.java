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
public class NotificationResponseDTO {

    private Long id;
    private String title;
    private String message;
    private String type;
    private Long recipientId;
    private String recipientName;
    private Long ticketId;
    private String ticketNumber;
    private LocalDateTime createdAt;
    private boolean isRead;
}
