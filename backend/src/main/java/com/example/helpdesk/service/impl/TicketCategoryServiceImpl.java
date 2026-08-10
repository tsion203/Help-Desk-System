package com.example.helpdesk.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.helpdesk.dto.TicketCategoryCreateDTO;
import com.example.helpdesk.dto.TicketCategoryResponseDTO;
import com.example.helpdesk.model.TicketCategory;
import com.example.helpdesk.repository.TicketCategoryRepository;
import com.example.helpdesk.service.TicketCategoryService;
import com.example.helpdesk.exception.ResourceNotFoundException;
import com.example.helpdesk.exception.ConflictException;


@Service
public class TicketCategoryServiceImpl implements TicketCategoryService {

    private final TicketCategoryRepository categoryRepository;

    public TicketCategoryServiceImpl(TicketCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public TicketCategoryResponseDTO createCategory(TicketCategoryCreateDTO dto) {

        if (categoryRepository.findByNameIgnoreCase(dto.getName()).isPresent())
            throw new ConflictException("A ticket category with this name already exists.");

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
    public Page<TicketCategoryResponseDTO> getAllCategories(Pageable pageable) {
        return categoryRepository.findAll(pageable).map(category -> new TicketCategoryResponseDTO(
                category.getId(), category.getName(), category.getDescription()));
    }

    @Override
    public TicketCategoryResponseDTO updateCategory(Long id, TicketCategoryCreateDTO dto) {
        TicketCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(dto.getName(), id))
            throw new ConflictException("A ticket category with this name already exists.");
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
