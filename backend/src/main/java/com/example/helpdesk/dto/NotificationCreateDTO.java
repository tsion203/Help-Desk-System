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
public class NotificationCreateDTO {

    @NotBlank
    private String title;

    @NotBlank
    private String message;

    @NotBlank
    private String type;

    @NotNull
    private Long recipientId;

    private Long ticketId;
}
