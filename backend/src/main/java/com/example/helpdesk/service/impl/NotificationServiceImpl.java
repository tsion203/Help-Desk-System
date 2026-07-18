package com.example.helpdesk.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.helpdesk.dto.NotificationCreateDTO;
import com.example.helpdesk.dto.NotificationResponseDTO;
import com.example.helpdesk.exception.ResourceNotFoundException;
import com.example.helpdesk.model.Notification;
import com.example.helpdesk.model.Ticket;
import com.example.helpdesk.model.User;
import com.example.helpdesk.repository.NotificationRepository;
import com.example.helpdesk.repository.TicketRepository;
import com.example.helpdesk.repository.UserRepository;
import com.example.helpdesk.service.NotificationService;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;

    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            TicketRepository ticketRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
    }

    @Override
    @Transactional
    public NotificationResponseDTO create(NotificationCreateDTO notificationCreateDTO) {
        Notification notification = new Notification();
        notification.setTitle(notificationCreateDTO.getTitle());
        notification.setMessage(notificationCreateDTO.getMessage());
        notification.setType(notificationCreateDTO.getType());
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRecipient(resolveRecipient(notificationCreateDTO.getRecipientId()));
        notification.setTicket(notificationCreateDTO.getTicketId() != null
                ? findTicketById(notificationCreateDTO.getTicketId())
                : null);

        return mapToResponseDTO(notificationRepository.save(notification));
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getNotificationsForCurrentUser() {
        User currentUser = getCurrentUser();
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getUnreadNotificationsForCurrentUser() {
        User currentUser = getCurrentUser();
        return notificationRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public NotificationResponseDTO markAsRead(Long notificationId) {
        Notification notification = findNotificationById(notificationId);
        ensureOwner(notification);
        notification.setRead(true);
        return mapToResponseDTO(notificationRepository.save(notification));
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        User currentUser = getCurrentUser();
        List<Notification> unreadNotifications = notificationRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(currentUser.getId());
        unreadNotifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    private Notification findNotificationById(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
    }

    private User resolveRecipient(Long recipientId) {
        if (recipientId != null) {
            return userRepository.findById(recipientId).orElseGet(this::getCurrentUser);
        }
        return getCurrentUser();
    }

    private Ticket findTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new ResourceNotFoundException("Authenticated user not found");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private void ensureOwner(Notification notification) {
        User currentUser = getCurrentUser();
        if (notification.getRecipient() == null || !currentUser.getId().equals(notification.getRecipient().getId())) {
            throw new ResourceNotFoundException("Notification not found for current user");
        }
    }

    private NotificationResponseDTO mapToResponseDTO(Notification notification) {
        User recipient = notification.getRecipient();
        Ticket ticket = notification.getTicket();
        return new NotificationResponseDTO(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                recipient != null ? recipient.getId() : null,
                recipient != null ? recipient.getFirstName() + " " + recipient.getLastName() : null,
                ticket != null ? ticket.getId() : null,
                ticket != null ? ticket.getTicketNumber() : null,
                notification.getCreatedAt(),
                notification.isRead()
        );
    }
}
