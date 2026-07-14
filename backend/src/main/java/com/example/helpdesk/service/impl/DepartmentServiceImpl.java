package com.example.helpdesk.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.helpdesk.dto.DepartmentCreateDTO;
import com.example.helpdesk.dto.DepartmentResponseDTO;
import com.example.helpdesk.exception.ResourceNotFoundException;
import com.example.helpdesk.model.Department;
import com.example.helpdesk.repository.DepartmentRepository;
import com.example.helpdesk.service.DepartmentService;

@Service
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentServiceImpl(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Override
    public DepartmentResponseDTO create(DepartmentCreateDTO departmentCreateDTO) {
        Department department = new Department();
        department.setName(departmentCreateDTO.getName());
        department.setDescription(departmentCreateDTO.getDescription());
        return mapToResponseDTO(departmentRepository.save(department));
    }

    @Override
    public DepartmentResponseDTO getById(Long id) {
        return mapToResponseDTO(findDepartmentById(id));
    }

    @Override
    public List<DepartmentResponseDTO> getAll() {
        return departmentRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    @Override
    public DepartmentResponseDTO update(Long id, DepartmentCreateDTO departmentCreateDTO) {
        Department department = findDepartmentById(id);
        department.setName(departmentCreateDTO.getName());
        department.setDescription(departmentCreateDTO.getDescription());
        return mapToResponseDTO(departmentRepository.save(department));
    }

    @Override
    public void delete(Long id) {
        Department department = findDepartmentById(id);
        departmentRepository.delete(department);
    }

    private Department findDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
    }

    private DepartmentResponseDTO mapToResponseDTO(Department department) {
        return new DepartmentResponseDTO(
                department.getId(),
                department.getName(),
                department.getDescription()
        );
    }
}
