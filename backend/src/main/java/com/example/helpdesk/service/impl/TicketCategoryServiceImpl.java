package com.example.helpdesk.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.helpdesk.dto.TicketCategoryCreateDTO;
import com.example.helpdesk.dto.TicketCategoryResponseDTO;
import com.example.helpdesk.model.TicketCategory;
import com.example.helpdesk.repository.TicketCategoryRepository;
import com.example.helpdesk.service.TicketCategoryService;
import com.example.helpdesk.exception.ResourceNotFoundException;


@Service
public class TicketCategoryServiceImpl implements TicketCategoryService {

    private final TicketCategoryRepository categoryRepository;

    public TicketCategoryServiceImpl(TicketCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public TicketCategoryResponseDTO createCategory(TicketCategoryCreateDTO dto) {

        TicketCategory category = new TicketCategory();

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());

        TicketCategory savedCategory = categoryRepository.save(category);

        return new TicketCategoryResponseDTO(
                savedCategory.getId(),
                savedCategory.getName(),
                savedCategory.getDescription()
        );
    }

    @Override
    public List<TicketCategoryResponseDTO> getAllCategories() {

        return categoryRepository.findAll()
                .stream()
                .map(category -> new TicketCategoryResponseDTO(
                        category.getId(),
                        category.getName(),
                        category.getDescription()))
                .collect(Collectors.toList());
    }

    @Override
    public TicketCategoryResponseDTO getCategoryById(Long id) {

        TicketCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        return new TicketCategoryResponseDTO(
                category.getId(),
                category.getName(),
                category.getDescription());
    }

    @Override
    public TicketCategoryResponseDTO updateCategory(Long id, TicketCategoryCreateDTO dto) {
        TicketCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        TicketCategory saved = categoryRepository.save(category);
        return new TicketCategoryResponseDTO(saved.getId(), saved.getName(), saved.getDescription());
    }

    @Override
    public void deleteCategory(Long id) {

        TicketCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        categoryRepository.delete(category);
    }
}
