package com.example.helpdesk.service;

import java.util.List;

import com.example.helpdesk.dto.DepartmentCreateDTO;
import com.example.helpdesk.dto.DepartmentResponseDTO;

public interface DepartmentService {

    DepartmentResponseDTO create(DepartmentCreateDTO departmentCreateDTO);

    DepartmentResponseDTO getById(Long id);

    List<DepartmentResponseDTO> getAll();

    DepartmentResponseDTO update(Long id, DepartmentCreateDTO departmentCreateDTO);

    void delete(Long id);
}
