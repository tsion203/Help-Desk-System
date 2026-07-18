package com.example.helpdesk.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.helpdesk.dto.NotificationCreateDTO;
import com.example.helpdesk.dto.TicketCommentCreateDTO;
import com.example.helpdesk.dto.TicketCommentResponseDTO;
import com.example.helpdesk.exception.ResourceNotFoundException;
import com.example.helpdesk.model.Ticket;
import com.example.helpdesk.model.TicketComment;
import com.example.helpdesk.model.User;
import com.example.helpdesk.repository.TicketCommentRepository;
import com.example.helpdesk.repository.TicketRepository;
import com.example.helpdesk.repository.UserRepository;
import com.example.helpdesk.service.NotificationService;
import com.example.helpdesk.service.TicketCommentService;

@Service
public class TicketCommentServiceImpl implements TicketCommentService {

    private final TicketCommentRepository ticketCommentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TicketCommentServiceImpl(
            TicketCommentRepository ticketCommentRepository,
            TicketRepository ticketRepository,
            UserRepository userRepository,
            NotificationService notificationService
    ) {
        this.ticketCommentRepository = ticketCommentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Override
    public TicketCommentResponseDTO create(TicketCommentCreateDTO ticketCommentCreateDTO) {
        TicketComment ticketComment = new TicketComment();
        ticketComment.setComment(ticketCommentCreateDTO.getComment());
        ticketComment.setCommentedAt(LocalDateTime.now());
        Ticket ticket = findTicketById(ticketCommentCreateDTO.getTicketId());
        User commentAuthor = findUserById(ticketCommentCreateDTO.getUserId());
        ticketComment.setTicket(ticket);
        ticketComment.setUser(commentAuthor);
        TicketComment savedComment = ticketCommentRepository.save(ticketComment);
        createNotificationForComment(ticket, commentAuthor);
        return mapToResponseDTO(savedComment);
    }

    @Override
    public TicketCommentResponseDTO getById(Long id) {
        return mapToResponseDTO(findTicketCommentById(id));
    }

    @Override
    public List<TicketCommentResponseDTO> getAll() {
        return ticketCommentRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    @Override
    public TicketCommentResponseDTO update(Long id, TicketCommentCreateDTO ticketCommentCreateDTO) {
        TicketComment ticketComment = findTicketCommentById(id);
        ticketComment.setComment(ticketCommentCreateDTO.getComment());
        ticketComment.setTicket(findTicketById(ticketCommentCreateDTO.getTicketId()));
        ticketComment.setUser(findUserById(ticketCommentCreateDTO.getUserId()));
        return mapToResponseDTO(ticketCommentRepository.save(ticketComment));
    }

    @Override
    public void delete(Long id) {
        TicketComment ticketComment = findTicketCommentById(id);
        ticketCommentRepository.delete(ticketComment);
    }

    private TicketComment findTicketCommentById(Long id) {
        return ticketCommentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket comment not found with id: " + id));
    }

    private Ticket findTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    private void createNotificationForComment(Ticket ticket, User commentAuthor) {
        if (ticket == null || commentAuthor == null) {
            return;
        }

        if (ticket.getCreatedBy() != null && !ticket.getCreatedBy().getId().equals(commentAuthor.getId())) {
            notificationService.create(new NotificationCreateDTO(
                    "New comment",
                    "A new comment was added to ticket " + ticket.getTicketNumber() + ".",
                    "TICKET_COMMENT_ADDED",
                    ticket.getCreatedBy().getId(),
                    ticket.getId()
            ));
        }

        if (ticket.getAssignedTo() != null && !ticket.getAssignedTo().getId().equals(commentAuthor.getId())) {
            notificationService.create(new NotificationCreateDTO(
                    "New comment",
                    "A new comment was added to ticket " + ticket.getTicketNumber() + ".",
                    "TICKET_COMMENT_ADDED",
                    ticket.getAssignedTo().getId(),
                    ticket.getId()
            ));
        }
    }

    private TicketCommentResponseDTO mapToResponseDTO(TicketComment ticketComment) {
        Ticket ticket = ticketComment.getTicket();
        User user = ticketComment.getUser();
        return new TicketCommentResponseDTO(
                ticketComment.getId(),
                ticketComment.getComment(),
                ticketComment.getCommentedAt(),
                ticket != null ? ticket.getId() : null,
                user != null ? user.getId() : null,
                getUserFullName(user)
        );
    }

    private String getUserFullName(User user) {
        if (user == null) {
            return null;
        }
        return user.getFirstName() + " " + user.getLastName();
    }
}
