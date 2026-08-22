package com.example.helpdesk.service.impl;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.example.helpdesk.dto.TicketCategoryCreateDTO;
import com.example.helpdesk.dto.TicketCategoryResponseDTO;
import com.example.helpdesk.exception.ConflictException;
import com.example.helpdesk.exception.ResourceNotFoundException;
import com.example.helpdesk.model.TicketCategory;
import com.example.helpdesk.repository.TicketCategoryRepository;
import com.example.helpdesk.service.TicketCategoryService;

@Service
public class TicketCategoryServiceImpl implements TicketCategoryService {
    private final TicketCategoryRepository categoryRepository;
    public TicketCategoryServiceImpl(TicketCategoryRepository categoryRepository) { this.categoryRepository = categoryRepository; }
    @Override public TicketCategoryResponseDTO createCategory(TicketCategoryCreateDTO dto) {
        if (categoryRepository.findByNameIgnoreCase(dto.getName()).isPresent()) throw new ConflictException("A ticket category with this name already exists.");
        TicketCategory category = new TicketCategory();
        category.setName(dto.getName()); category.setDescription(dto.getDescription()); category.setActive(true);
        return map(categoryRepository.save(category));
    }
    @Override public List<TicketCategoryResponseDTO> getAllCategories() { return categoryRepository.findAll().stream().map(this::map).toList(); }
    @Override public Page<TicketCategoryResponseDTO> getAllCategories(Pageable pageable) { return categoryRepository.findAll(pageable).map(this::map); }
    @Override public TicketCategoryResponseDTO getCategoryById(Long id) { return map(find(id)); }
    @Override public TicketCategoryResponseDTO updateCategory(Long id, TicketCategoryCreateDTO dto) {
        TicketCategory category = find(id);
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(dto.getName(), id)) throw new ConflictException("A ticket category with this name already exists.");
        category.setName(dto.getName()); category.setDescription(dto.getDescription());
        return map(categoryRepository.save(category));
    }
    @Override public void deleteCategory(Long id) { setActive(id, false); }
    @Override public TicketCategoryResponseDTO setActive(Long id, boolean active) {
        TicketCategory category = find(id); category.setActive(active); return map(categoryRepository.save(category));
    }
    private TicketCategory find(Long id) { return categoryRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id)); }
    private TicketCategoryResponseDTO map(TicketCategory category) { return new TicketCategoryResponseDTO(category.getId(), category.getName(), category.getDescription(), category.isActive()); }
}
