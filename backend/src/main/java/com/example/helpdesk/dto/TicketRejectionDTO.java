package com.example.helpdesk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TicketRejectionDTO {
    @NotBlank(message = "Rejection reason is required.")
    @Size(max = 2000, message = "Rejection reason must not exceed 2000 characters.")
    private String reason;
}
