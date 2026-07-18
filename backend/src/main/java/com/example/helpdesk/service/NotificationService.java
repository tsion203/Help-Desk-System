package com.example.helpdesk.service;

import java.util.List;

import com.example.helpdesk.dto.NotificationCreateDTO;
import com.example.helpdesk.dto.NotificationResponseDTO;

public interface NotificationService {

    NotificationResponseDTO create(NotificationCreateDTO notificationCreateDTO);

    List<NotificationResponseDTO> getNotificationsForCurrentUser();

    List<NotificationResponseDTO> getUnreadNotificationsForCurrentUser();

    NotificationResponseDTO markAsRead(Long notificationId);

    void markAllAsRead();
}
