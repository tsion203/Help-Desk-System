package com.example.helpdesk.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.helpdesk.model.TicketCategory;

@Repository
public interface TicketCategoryRepository extends JpaRepository<TicketCategory, Long> {
}