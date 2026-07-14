package com.example.helpdesk.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.helpdesk.dto.RoleCreateDTO;
import com.example.helpdesk.dto.RoleResponseDTO;
import com.example.helpdesk.exception.ResourceNotFoundException;
import com.example.helpdesk.model.Role;
import com.example.helpdesk.repository.RoleRepository;
import com.example.helpdesk.service.RoleService;

@Service
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    public RoleServiceImpl(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public RoleResponseDTO create(RoleCreateDTO roleCreateDTO) {
        Role role = new Role();
        role.setName(roleCreateDTO.getName());
        role.setDescription(roleCreateDTO.getDescription());
        return mapToResponseDTO(roleRepository.save(role));
    }

    @Override
    public RoleResponseDTO getById(Long id) {
        return mapToResponseDTO(findRoleById(id));
    }

    @Override
    public List<RoleResponseDTO> getAll() {
        return roleRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    @Override
    public RoleResponseDTO update(Long id, RoleCreateDTO roleCreateDTO) {
        Role role = findRoleById(id);
        role.setName(roleCreateDTO.getName());
        role.setDescription(roleCreateDTO.getDescription());
        return mapToResponseDTO(roleRepository.save(role));
    }

    @Override
    public void delete(Long id) {
        Role role = findRoleById(id);
        roleRepository.delete(role);
    }

    private Role findRoleById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + id));
    }

    private RoleResponseDTO mapToResponseDTO(Role role) {
        return new RoleResponseDTO(
                role.getId(),
                role.getName(),
                role.getDescription()
        );
    }
}
