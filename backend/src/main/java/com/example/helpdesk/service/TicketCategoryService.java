
package com.example.helpdesk.service;

import java.util.List;

import com.example.helpdesk.dto.TicketCategoryCreateDTO;
import com.example.helpdesk.dto.TicketCategoryResponseDTO;

public interface TicketCategoryService {

    TicketCategoryResponseDTO createCategory(TicketCategoryCreateDTO dto);

    List<TicketCategoryResponseDTO> getAllCategories();

    TicketCategoryResponseDTO getCategoryById(Long id);

    void deleteCategory(Long id);
}