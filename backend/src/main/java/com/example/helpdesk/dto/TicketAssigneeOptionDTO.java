package com.example.helpdesk.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TicketAssigneeOptionDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private Long activeTicketCount;
}
