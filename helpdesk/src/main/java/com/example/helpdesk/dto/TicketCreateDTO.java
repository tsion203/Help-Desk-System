package com.example.helpdesk.dto;

import com.example.helpdesk.model.TicketPriority;
import com.example.helpdesk.model.TicketStatus;

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
public class TicketCreateDTO {

    @NotBlank
    private String subject;

    @NotBlank
    private String description;

    private TicketStatus status;

    @NotNull
    private TicketPriority priority;

    @NotNull
    private Long createdById;

    private Long assignedToId;

    private Long categoryId;
}
