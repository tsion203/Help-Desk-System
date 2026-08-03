package com.example.helpdesk.dto;

import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserCreateDTO {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String employeeId;

    @NotBlank
    @Size(min = 8, message = "Temporary password must contain at least 8 characters")
    private String temporaryPassword;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotBlank
    private String phoneNumber;

    @NotNull
    private Boolean active;

    @NotNull
    @Positive
    private Long departmentId;

    @NotEmpty
    private List<@Positive Long> roleIds;

}
