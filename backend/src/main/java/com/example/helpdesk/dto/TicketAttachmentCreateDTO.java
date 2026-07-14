package com.example.helpdesk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TicketAttachmentCreateDTO {

    @NotBlank(message = "File name is required")
    private String fileName;

    @NotBlank(message = "File path is required")
    private String filePath;

    @NotNull(message = "File size is required")
    private Long fileSize;

    @NotNull(message = "Ticket ID is required")
    private Long ticketId;

    @NotNull(message = "Uploader ID is required")
    private Long uploadedById;
}