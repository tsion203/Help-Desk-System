package com.example.helpdesk.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.helpdesk.dto.TicketCategoryCreateDTO;
import com.example.helpdesk.dto.TicketCategoryResponseDTO;
import com.example.helpdesk.model.TicketCategory;
import com.example.helpdesk.repository.TicketCategoryRepository;
import com.example.helpdesk.service.TicketCategoryService;


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
                .orElseThrow(() -> new RuntimeException("Category not found"));

        return new TicketCategoryResponseDTO(
                category.getId(),
                category.getName(),
                category.getDescription());
    }

    @Override
    public void deleteCategory(Long id) {

        categoryRepository.deleteById(id);
    }
}