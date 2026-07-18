package com.example.helpdesk.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.example.helpdesk.dto.NotificationCreateDTO;
import com.example.helpdesk.dto.NotificationResponseDTO;
import com.example.helpdesk.model.Notification;
import com.example.helpdesk.model.Ticket;
import com.example.helpdesk.model.User;
import com.example.helpdesk.repository.NotificationRepository;
import com.example.helpdesk.repository.TicketRepository;
import com.example.helpdesk.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TicketRepository ticketRepository;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    @Test
    void createPersistsNotificationAndMapsToResponse() {
        User recipient = new User();
        recipient.setId(1L);
        recipient.setEmail("user@example.com");
        recipient.setFirstName("Ada");
        recipient.setLastName("Lovelace");

        Ticket ticket = new Ticket();
        ticket.setId(10L);
        ticket.setTicketNumber("TICKET-123");

        when(userRepository.findById(1L)).thenReturn(Optional.of(recipient));

        Notification savedNotification = new Notification();
        savedNotification.setId(5L);
        savedNotification.setTitle("Ticket created");
        savedNotification.setMessage("Your ticket was created");
        savedNotification.setType("TICKET_CREATED");
        savedNotification.setRead(false);
        savedNotification.setCreatedAt(LocalDateTime.now());
        savedNotification.setRecipient(recipient);
        savedNotification.setTicket(ticket);

        when(notificationRepository.save(any(Notification.class))).thenReturn(savedNotification);

        NotificationCreateDTO createDTO = new NotificationCreateDTO(
                "Ticket created",
                "Your ticket was created",
                "TICKET_CREATED",
                1L,
                null
        );

        NotificationResponseDTO response = notificationService.create(createDTO);

        assertNotNull(response);
        assertEquals("Ticket created", response.getTitle());
        assertEquals(1L, response.getRecipientId());
        assertFalse(response.isRead());
        verify(notificationRepository).save(any(Notification.class));
    }
}
