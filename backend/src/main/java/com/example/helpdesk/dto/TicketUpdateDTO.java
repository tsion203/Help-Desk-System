package com.example.helpdesk.dto;

import com.example.helpdesk.model.TicketPriority;
import com.example.helpdesk.model.TicketStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.validation.constraints.Positive;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TicketUpdateDTO {

    private String subject;

    private String description;

    private TicketStatus status;

    private TicketPriority priority;

    private Long assignedToId;

    @Positive
    private Long categoryId;
}
