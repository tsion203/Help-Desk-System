package com.example.helpdesk.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.helpdesk.model.TicketAssignmentHistory;

@Repository
public interface TicketAssignmentHistoryRepository extends JpaRepository<TicketAssignmentHistory, Long> {

    List<TicketAssignmentHistory> findByTicketIdOrderByAssignedAtAsc(Long ticketId);

    Optional<TicketAssignmentHistory> findFirstByTicketIdAndNewAssigneeIdOrderByAssignedAtDesc(Long ticketId, Long assigneeId);
}
