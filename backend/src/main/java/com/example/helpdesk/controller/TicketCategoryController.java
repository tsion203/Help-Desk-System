package com.example.helpdesk.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.validation.annotation.Validated;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.helpdesk.dto.TicketCategoryCreateDTO;
import com.example.helpdesk.dto.TicketCategoryResponseDTO;
import com.example.helpdesk.service.TicketCategoryService;

@RestController
@RequestMapping("/api/categories")
public class TicketCategoryController {

    private final TicketCategoryService categoryService;

    public TicketCategoryController(TicketCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketCategoryResponseDTO> createCategory(
            @Validated @RequestBody TicketCategoryCreateDTO dto) {

        return new ResponseEntity<>(
                categoryService.createCategory(dto),
                HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<TicketCategoryResponseDTO>> getAllCategories(
            @PageableDefault(size = 5, sort = "name") Pageable pageable) {
        return ResponseEntity.ok(categoryService.getAllCategories(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketCategoryResponseDTO> getCategory(@PathVariable Long id) {

        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {

        categoryService.deleteCategory(id);

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketCategoryResponseDTO> updateCategory(
            @PathVariable Long id, @Validated @RequestBody TicketCategoryCreateDTO dto) {
        return ResponseEntity.ok(categoryService.updateCategory(id, dto));
    }
}
