package com.example.helpdesk.service.impl;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.helpdesk.dto.RoleResponseDTO;
import com.example.helpdesk.dto.UserCreateDTO;
import com.example.helpdesk.dto.UserResponseDTO;
import com.example.helpdesk.dto.UserUpdateDTO;
import com.example.helpdesk.exception.ResourceNotFoundException;
import com.example.helpdesk.model.Department;
import com.example.helpdesk.model.Role;
import com.example.helpdesk.model.User;
import com.example.helpdesk.repository.DepartmentRepository;
import com.example.helpdesk.repository.RoleRepository;
import com.example.helpdesk.repository.UserRepository;
import com.example.helpdesk.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserResponseDTO create(UserCreateDTO userCreateDTO) {
        User user = new User();
        try {
            user.setEmail(userCreateDTO.getEmail());
            user.setEmployeeId(userCreateDTO.getEmployeeId());
            user.setFirstName(userCreateDTO.getFirstName());
            user.setLastName(userCreateDTO.getLastName());
            user.setPhoneNumber(userCreateDTO.getPhoneNumber());
            user.setActive(userCreateDTO.getActive());
            user.setPassword(passwordEncoder.encode("password123"));
            user.setDepartment(findDepartmentById(userCreateDTO.getDepartmentId()));
            user.setRoles(findRolesByIds(userCreateDTO.getRoleIds()));
            return mapToResponseDTO(userRepository.save(user));
        } catch (Exception ex) {
            System.out.println("Error occure:" + ex.getMessage());
            return null;
        }
        finally{
       
        }

        
    }

    @Override
    public UserResponseDTO getById(Long id) {
        return mapToResponseDTO(findUserById(id));
    }

    @Override
    public List<UserResponseDTO> getAll() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    @Override
    public UserResponseDTO update(Long id, UserUpdateDTO userUpdateDTO) {
        User user = findUserById(id);

        if (userUpdateDTO.getEmail() != null) {
            user.setEmail(userUpdateDTO.getEmail());
        }
        if (userUpdateDTO.getEmployeeId() != null) {
            user.setEmployeeId(userUpdateDTO.getEmployeeId());
        }
        if (userUpdateDTO.getFirstName() != null) {
            user.setFirstName(userUpdateDTO.getFirstName());
        }
        if (userUpdateDTO.getLastName() != null) {
            user.setLastName(userUpdateDTO.getLastName());
        }
        if (userUpdateDTO.getPhoneNumber() != null) {
            user.setPhoneNumber(userUpdateDTO.getPhoneNumber());
        }
        if (userUpdateDTO.getActive() != null) {
            user.setActive(userUpdateDTO.getActive());
        }
        if (userUpdateDTO.getDepartmentId() != null) {
            user.setDepartment(findDepartmentById(userUpdateDTO.getDepartmentId()));
        }
        if (userUpdateDTO.getRoleIds() != null) {
            user.setRoles(findRolesByIds(userUpdateDTO.getRoleIds()));
        }

        return mapToResponseDTO(userRepository.save(user));
    }

    @Override
    public void delete(Long id) {
        User user = findUserById(id);
        userRepository.delete(user);
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    private Department findDepartmentById(Long id) {
        if (id == null) {
            return null;
        }
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
    }

    private List<Role> findRolesByIds(List<Long> roleIds) {
        if (roleIds == null || roleIds.isEmpty()) {
            return List.of();
        }
        List<Role> roles = roleRepository.findAllById(roleIds);
        if (roles.size() != roleIds.size()) {
            throw new ResourceNotFoundException("One or more roles were not found");
        }
        return roles;
    }

    private UserResponseDTO mapToResponseDTO(User user) {
        Department department = user.getDepartment();
        return new UserResponseDTO(
                user.getId(),
                user.getEmail(),
                user.getEmployeeId(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhoneNumber(),
                user.isActive(),
                department != null ? department.getId() : null,
                department != null ? department.getName() : null,
                mapRolesToResponseDTOs(user.getRoles())
        );
    }

    private List<RoleResponseDTO> mapRolesToResponseDTOs(List<Role> roles) {
        if (roles == null) {
            return List.of();
        }
        return roles.stream()
                .map(role -> new RoleResponseDTO(role.getId(), role.getName(), role.getDescription()))
                .toList();
    }
}
