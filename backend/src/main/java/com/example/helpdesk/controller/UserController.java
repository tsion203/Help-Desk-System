package com.example.helpdesk.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.helpdesk.dto.UserCreateDTO;
import com.example.helpdesk.dto.UserResponseDTO;
import com.example.helpdesk.dto.AdminUserUpdateDTO;
import com.example.helpdesk.dto.UserProfileUpdateDTO;
import com.example.helpdesk.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody UserCreateDTO userCreateDTO) {
        UserResponseDTO createdUser = userService.create(userCreateDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponseDTO>> getAllUsers(@RequestParam(required = false) String role,
            @PageableDefault(size = 5, sort = "firstName") Pageable pageable) {
        return ResponseEntity.ok(userService.getAll(role, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @rbac.isCurrentUser(#id, authentication)")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserUpdateDTO userUpdateDTO
    ) {
        return ResponseEntity.ok(userService.updateByAdmin(id, userUpdateDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponseDTO> getCurrentProfile() {
        return ResponseEntity.ok(userService.getCurrentProfile());
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponseDTO> updateCurrentProfile(
            @Valid @RequestBody UserProfileUpdateDTO userProfileUpdateDTO) {
        return ResponseEntity.ok(userService.updateCurrentProfile(userProfileUpdateDTO));
    }
}
