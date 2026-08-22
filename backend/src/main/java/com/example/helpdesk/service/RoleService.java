package com.example.helpdesk.service;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.helpdesk.dto.RoleCreateDTO;
import com.example.helpdesk.dto.RoleResponseDTO;

public interface RoleService {

    RoleResponseDTO create(RoleCreateDTO roleCreateDTO);

    RoleResponseDTO getById(Long id);

    List<RoleResponseDTO> getAll();
    Page<RoleResponseDTO> getAll(Pageable pageable);

    RoleResponseDTO update(Long id, RoleCreateDTO roleCreateDTO);

    void delete(Long id);
    RoleResponseDTO setActive(Long id, boolean active);
}
