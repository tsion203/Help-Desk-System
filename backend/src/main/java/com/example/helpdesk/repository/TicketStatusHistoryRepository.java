package com.example.helpdesk.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.helpdesk.model.TicketStatusHistory;

@Repository
public interface TicketStatusHistoryRepository extends JpaRepository<TicketStatusHistory, Long> {

    List<TicketStatusHistory> findByTicketIdOrderByChangedAtAsc(Long ticketId);

    boolean existsByTicketIdAndNewStatus(Long ticketId, String newStatus);

    Optional<TicketStatusHistory> findFirstByTicketIdAndNewStatusOrderByChangedAtDesc(
            Long ticketId, String newStatus);
}
