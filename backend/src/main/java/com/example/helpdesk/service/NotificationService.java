package com.example.helpdesk.service;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.helpdesk.dto.NotificationCreateDTO;
import com.example.helpdesk.dto.NotificationResponseDTO;

public interface NotificationService {

    NotificationResponseDTO create(NotificationCreateDTO notificationCreateDTO);

    List<NotificationResponseDTO> getNotificationsForCurrentUser();
    Page<NotificationResponseDTO> getNotificationsForCurrentUser(Pageable pageable);

    List<NotificationResponseDTO> getUnreadNotificationsForCurrentUser();

    NotificationResponseDTO markAsRead(Long notificationId);

    void markAllAsRead();
}
