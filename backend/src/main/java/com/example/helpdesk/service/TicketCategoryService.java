
package com.example.helpdesk.service;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.helpdesk.dto.TicketCategoryCreateDTO;
import com.example.helpdesk.dto.TicketCategoryResponseDTO;

public interface TicketCategoryService {

    TicketCategoryResponseDTO createCategory(TicketCategoryCreateDTO dto);

    List<TicketCategoryResponseDTO> getAllCategories();
    Page<TicketCategoryResponseDTO> getAllCategories(Pageable pageable);

    TicketCategoryResponseDTO getCategoryById(Long id);

    TicketCategoryResponseDTO updateCategory(Long id, TicketCategoryCreateDTO dto);

    void deleteCategory(Long id);
}
