package com.example.helpdesk.service;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.helpdesk.dto.DepartmentCreateDTO;
import com.example.helpdesk.dto.DepartmentResponseDTO;

public interface DepartmentService {

    DepartmentResponseDTO create(DepartmentCreateDTO departmentCreateDTO);

    DepartmentResponseDTO getById(Long id);

    List<DepartmentResponseDTO> getAll();
    Page<DepartmentResponseDTO> getAll(Pageable pageable);

    DepartmentResponseDTO update(Long id, DepartmentCreateDTO departmentCreateDTO);

    void delete(Long id);
    DepartmentResponseDTO setActive(Long id, boolean active);
}
