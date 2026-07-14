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
public class TicketAttachmentResponseDTO {

    private Long id;

    private String fileName;

    private String filePath;

    private Long fileSize;

    private LocalDateTime uploadedAt;

    private Long ticketId;

    private Long uploadedById;

    private String uploadedByName;
}
