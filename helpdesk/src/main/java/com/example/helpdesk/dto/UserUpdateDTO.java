package com.example.helpdesk.dto;

import java.util.List;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDTO {

    @Email
    private String email;

    private String employeeId;

    private String firstName;

    private String lastName;

    private String phoneNumber;

    private Boolean active;

    private Long departmentId;

    private List<Long> roleIds;
}
