package com.example.helpdesk.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {

    private Long id;

    private String email;

    private String employeeId;

    private String firstName;

    private String lastName;

    private String phoneNumber;

    private boolean active;

    private Long departmentId;

    private String departmentName;

    private List<RoleResponseDTO> roles;
}
