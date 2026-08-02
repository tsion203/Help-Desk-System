package com.example.helpdesk.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.helpdesk.dto.LoginRequestDTO;
import com.example.helpdesk.dto.LoginResponseDTO;
import com.example.helpdesk.dto.RegisterRequestDTO;
import com.example.helpdesk.model.Department;
import com.example.helpdesk.model.Role;
import com.example.helpdesk.model.User;
import com.example.helpdesk.repository.DepartmentRepository;
import com.example.helpdesk.repository.RoleRepository;
import com.example.helpdesk.repository.UserRepository;
import com.example.helpdesk.security.JwtUtil;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtUtil jwtUtil,
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequestDTO) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequestDTO.getEmail(), loginRequestDTO.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(authority -> authority.getAuthority().replaceFirst("^ROLE_", ""))
                .toList();
        String token = jwtUtil.generateToken(userDetails.getUsername(), roles);

        LoginResponseDTO responseDTO = new LoginResponseDTO(token, "Bearer", userDetails.getUsername(), primaryRole(roles));
        return ResponseEntity.ok(responseDTO);
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponseDTO> register(@Valid @RequestBody RegisterRequestDTO registerRequestDTO) {
        if (userRepository.findByEmail(registerRequestDTO.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        User user = new User();
        user.setEmail(registerRequestDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequestDTO.getPassword()));
        user.setEmployeeId(registerRequestDTO.getEmployeeId());
        user.setFirstName(registerRequestDTO.getFirstName());
        user.setLastName(registerRequestDTO.getLastName());
        user.setPhoneNumber(registerRequestDTO.getPhoneNumber());
        user.setActive(Boolean.TRUE.equals(registerRequestDTO.getActive()));

        if (registerRequestDTO.getDepartmentId() != null) {
            Department department = departmentRepository.findById(registerRequestDTO.getDepartmentId())
                    .orElseThrow(() -> new IllegalArgumentException("Department not found"));
            user.setDepartment(department);
        }

        Role employeeRole = roleRepository.findAll().stream()
                .filter(role -> "EMPLOYEE".equals(role.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("EMPLOYEE role is not configured"));
        user.setRoles(List.of(employeeRole));

        userRepository.save(user);
        List<String> roleNames = user.getRoles() == null ? List.of() : user.getRoles().stream()
                .map(Role::getName).map(this::normalizeRoleName).toList();
        String token = jwtUtil.generateToken(user.getEmail(), roleNames);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new LoginResponseDTO(token, "Bearer", user.getEmail(), primaryRole(roleNames)));
    }

    private String primaryRole(List<String> roles) {
        return roles == null || roles.isEmpty() ? null : normalizeRoleName(roles.get(0));
    }

    private String normalizeRoleName(String role) {
        return role == null ? null : role.trim().toUpperCase().replaceFirst("^ROLE_", "");
    }
}
