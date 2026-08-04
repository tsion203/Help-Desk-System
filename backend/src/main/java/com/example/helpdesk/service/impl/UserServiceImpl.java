package com.example.helpdesk.service.impl;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.data.jpa.domain.Specification;

import com.example.helpdesk.dto.RoleResponseDTO;
import com.example.helpdesk.dto.UserCreateDTO;
import com.example.helpdesk.dto.UserResponseDTO;
import com.example.helpdesk.dto.AdminUserUpdateDTO;
import com.example.helpdesk.dto.UserProfileUpdateDTO;
import org.springframework.security.core.context.SecurityContextHolder;
import com.example.helpdesk.exception.CurrentPasswordException;
import com.example.helpdesk.exception.ConflictException;
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
        validateUniqueIdentity(userCreateDTO.getEmail(), userCreateDTO.getEmployeeId(), null);
        User user = new User();
        user.setEmail(userCreateDTO.getEmail());
        user.setEmployeeId(userCreateDTO.getEmployeeId());
        user.setFirstName(userCreateDTO.getFirstName());
        user.setLastName(userCreateDTO.getLastName());
        user.setPhoneNumber(userCreateDTO.getPhoneNumber());
        user.setActive(userCreateDTO.getActive());
        user.setPassword(passwordEncoder.encode(userCreateDTO.getTemporaryPassword()));
        user.setDepartment(findDepartmentById(userCreateDTO.getDepartmentId()));
        user.setRoles(findRolesByIds(userCreateDTO.getRoleIds()));
        return mapToResponseDTO(userRepository.save(user));
    }

    @Override
    public UserResponseDTO getById(Long id) {
        return mapToResponseDTO(findUserById(id));
    }

    @Override
    public List<UserResponseDTO> getAll() {
        return getAll(null);
    }

    @Override
    public List<UserResponseDTO> getAll(String role) {
        Specification<User> specification = (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();
        if (role != null && !role.isBlank()) {
            String normalizedRole = role.trim().toUpperCase();
            specification = specification.and((root, query, criteriaBuilder) -> {
                query.distinct(true);
                return criteriaBuilder.equal(criteriaBuilder.upper(root.join("roles").get("name")), normalizedRole);
            });
        }
        return userRepository.findAll(specification)
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    @Override
    public UserResponseDTO updateByAdmin(Long id, AdminUserUpdateDTO userUpdateDTO) {
        User user = findUserById(id);
        validateUniqueIdentity(userUpdateDTO.getEmail(), userUpdateDTO.getEmployeeId(), id);

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
    public UserResponseDTO getCurrentProfile() {
        return mapToResponseDTO(findCurrentUser());
    }

    @Override
    public UserResponseDTO updateCurrentProfile(UserProfileUpdateDTO dto) {
        User user = findCurrentUser();
        if (userRepository.existsByEmailIgnoreCaseAndIdNot(dto.getEmail(), user.getId())) {
            throw new ConflictException("An account with this email already exists.");
        }
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setPhoneNumber(dto.getPhoneNumber());
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            if (dto.getCurrentPassword() == null
                    || !passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
                throw new CurrentPasswordException("Current password is incorrect");
            }
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
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

    private User findCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
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

    private void validateUniqueIdentity(String email, String employeeId, Long excludedId) {
        boolean duplicateEmail = excludedId == null
                ? userRepository.existsByEmailIgnoreCase(email)
                : userRepository.existsByEmailIgnoreCaseAndIdNot(email, excludedId);
        if (duplicateEmail) throw new ConflictException("An account with this email already exists.");
        boolean duplicateEmployeeId = excludedId == null
                ? userRepository.existsByEmployeeId(employeeId)
                : userRepository.existsByEmployeeIdAndIdNot(employeeId, excludedId);
        if (duplicateEmployeeId) throw new ConflictException("Employee ID already exists.");
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
