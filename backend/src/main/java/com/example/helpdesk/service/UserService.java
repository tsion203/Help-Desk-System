package com.example.helpdesk.service;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.helpdesk.dto.UserCreateDTO;
import com.example.helpdesk.dto.UserResponseDTO;
import com.example.helpdesk.dto.AdminUserUpdateDTO;
import com.example.helpdesk.dto.UserProfileUpdateDTO;

public interface UserService {

    UserResponseDTO create(UserCreateDTO userCreateDTO);

    UserResponseDTO getById(Long id);

    List<UserResponseDTO> getAll();

    List<UserResponseDTO> getAll(String role);
    Page<UserResponseDTO> getAll(String role, Pageable pageable);

    UserResponseDTO updateByAdmin(Long id, AdminUserUpdateDTO userUpdateDTO);

    UserResponseDTO getCurrentProfile();

    UserResponseDTO updateCurrentProfile(UserProfileUpdateDTO userProfileUpdateDTO);

    void delete(Long id);
}
