package com.example.helpdesk.service;

import java.util.List;

import com.example.helpdesk.dto.RoleCreateDTO;
import com.example.helpdesk.dto.RoleResponseDTO;

public interface RoleService {

    RoleResponseDTO create(RoleCreateDTO roleCreateDTO);

    RoleResponseDTO getById(Long id);

    List<RoleResponseDTO> getAll();

    RoleResponseDTO update(Long id, RoleCreateDTO roleCreateDTO);

    void delete(Long id);
}
