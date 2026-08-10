package com.example.helpdesk.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import com.example.helpdesk.model.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);
    Page<Notification> findByRecipientId(Long recipientId, Pageable pageable);

    List<Notification> findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(Long recipientId);
}
