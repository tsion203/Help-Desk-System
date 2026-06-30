package com.example.helpdesk.service;

import java.util.List;

import com.example.helpdesk.dto.UserCreateDTO;
import com.example.helpdesk.dto.UserResponseDTO;
import com.example.helpdesk.dto.UserUpdateDTO;

public interface UserService {

    UserResponseDTO create(UserCreateDTO userCreateDTO);

    UserResponseDTO getById(Long id);

    List<UserResponseDTO> getAll();

    UserResponseDTO update(Long id, UserUpdateDTO userUpdateDTO);

    void delete(Long id);
}
