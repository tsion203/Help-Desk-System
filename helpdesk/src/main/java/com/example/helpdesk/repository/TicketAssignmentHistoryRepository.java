package com.example.helpdesk.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.helpdesk.model.TicketAssignmentHistory;

@Repository
public interface TicketAssignmentHistoryRepository extends JpaRepository<TicketAssignmentHistory, Long> {
}
