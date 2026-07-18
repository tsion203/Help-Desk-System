package com.example.helpdesk.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.helpdesk.dto.NotificationCreateDTO;
import com.example.helpdesk.dto.TicketAssignmentHistoryResponseDTO;
import com.example.helpdesk.dto.TicketAttachmentResponseDTO;
import com.example.helpdesk.dto.TicketCommentResponseDTO;
import com.example.helpdesk.dto.TicketCreateDTO;
import com.example.helpdesk.dto.TicketResponseDTO;
import com.example.helpdesk.dto.TicketStatusHistoryResponseDTO;
import com.example.helpdesk.dto.TicketUpdateDTO;
import com.example.helpdesk.exception.ResourceNotFoundException;
import com.example.helpdesk.model.Ticket;
import com.example.helpdesk.model.TicketAssignmentHistory;
import com.example.helpdesk.model.TicketAttachment;
import com.example.helpdesk.model.TicketCategory;
import com.example.helpdesk.model.TicketComment;
import com.example.helpdesk.model.TicketStatus;
import com.example.helpdesk.model.TicketStatusHistory;
import com.example.helpdesk.model.User;
import com.example.helpdesk.repository.TicketAssignmentHistoryRepository;
import com.example.helpdesk.repository.TicketCategoryRepository;
import com.example.helpdesk.repository.TicketRepository;
import com.example.helpdesk.repository.TicketStatusHistoryRepository;
import com.example.helpdesk.repository.UserRepository;
import com.example.helpdesk.service.NotificationService;
import com.example.helpdesk.service.TicketService;

@Service
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketCategoryRepository ticketCategoryRepository;
    private final TicketAssignmentHistoryRepository ticketAssignmentHistoryRepository;
    private final TicketStatusHistoryRepository ticketStatusHistoryRepository;
    private final NotificationService notificationService;

    public TicketServiceImpl(
            TicketRepository ticketRepository,
            UserRepository userRepository,
            TicketCategoryRepository ticketCategoryRepository,
            TicketAssignmentHistoryRepository ticketAssignmentHistoryRepository,
            TicketStatusHistoryRepository ticketStatusHistoryRepository,
            NotificationService notificationService
    ) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.ticketCategoryRepository = ticketCategoryRepository;
        this.ticketAssignmentHistoryRepository = ticketAssignmentHistoryRepository;
        this.ticketStatusHistoryRepository = ticketStatusHistoryRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public TicketResponseDTO create(TicketCreateDTO ticketCreateDTO) {
        Ticket ticket = new Ticket();
        ticket.setTicketNumber(generateTicketNumber());
        ticket.setSubject(ticketCreateDTO.getSubject());
        ticket.setDescription(ticketCreateDTO.getDescription());
        ticket.setStatus(ticketCreateDTO.getStatus() != null ? ticketCreateDTO.getStatus() : TicketStatus.OPEN);
        ticket.setPriority(ticketCreateDTO.getPriority());
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        ticket.setCreatedBy(findUserById(ticketCreateDTO.getCreatedById()));
        ticket.setAssignedTo(findNullableUserById(ticketCreateDTO.getAssignedToId()));
        ticket.setCategory(findNullableCategoryById(ticketCreateDTO.getCategoryId()));
        Ticket savedTicket = ticketRepository.save(ticket);
        createNotificationForTicketCreation(savedTicket);
        return mapToResponseDTO(savedTicket);
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponseDTO getById(Long id) {
        return mapToResponseDTO(findTicketById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponseDTO> getAll() {
        return ticketRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public TicketResponseDTO update(Long id, TicketUpdateDTO ticketUpdateDTO) {
        Ticket ticket = findTicketById(id);

        if (ticketUpdateDTO.getSubject() != null) {
            ticket.setSubject(ticketUpdateDTO.getSubject());
        }
        if (ticketUpdateDTO.getDescription() != null) {
            ticket.setDescription(ticketUpdateDTO.getDescription());
        }
        if (ticketUpdateDTO.getStatus() != null) {
            ticket.setStatus(ticketUpdateDTO.getStatus());
            if (ticketUpdateDTO.getStatus() == TicketStatus.RESOLVED || ticketUpdateDTO.getStatus() == TicketStatus.CLOSED) {
                ticket.setResolvedAt(LocalDateTime.now());
            }
        }
        if (ticketUpdateDTO.getPriority() != null) {
            ticket.setPriority(ticketUpdateDTO.getPriority());
        }
        if (ticketUpdateDTO.getAssignedToId() != null) {
            ticket.setAssignedTo(findUserById(ticketUpdateDTO.getAssignedToId()));
        }
        if (ticketUpdateDTO.getCategoryId() != null) {
            ticket.setCategory(findCategoryById(ticketUpdateDTO.getCategoryId()));
        }

        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket savedTicket = ticketRepository.save(ticket);
        if (ticketUpdateDTO.getStatus() != null) {
            createNotificationForStatusChange(savedTicket, ticketUpdateDTO.getStatus());
        }
        return mapToResponseDTO(savedTicket);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Ticket ticket = findTicketById(id);
        ticketRepository.delete(ticket);
    }

    @Override
    @Transactional
    public TicketResponseDTO assignTicket(Long ticketId, Long assigneeId, Long assignedById) {
        Ticket ticket = findTicketById(ticketId);
        User oldAssignee = ticket.getAssignedTo();
        User newAssignee = findUserById(assigneeId);
        User assignedBy = findUserById(assignedById);

        ticket.setAssignedTo(newAssignee);
        ticket.setStatus(TicketStatus.ASSIGNED);
        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket savedTicket = ticketRepository.save(ticket);

        TicketAssignmentHistory history = new TicketAssignmentHistory();
        history.setTicket(savedTicket);
        history.setOldAssignee(oldAssignee);
        history.setNewAssignee(newAssignee);
        history.setAssignedBy(assignedBy);
        history.setAssignedAt(LocalDateTime.now());
        ticketAssignmentHistoryRepository.save(history);

        createNotificationForAssignment(savedTicket, oldAssignee, newAssignee, assignedBy);
        return mapToResponseDTO(savedTicket);
    }

    @Override
    @Transactional
    public TicketResponseDTO changeStatus(Long ticketId, TicketStatus newStatus, Long changedById) {
        Ticket ticket = findTicketById(ticketId);
        TicketStatus oldStatus = ticket.getStatus();
        User changedBy = findUserById(changedById);

        ticket.setStatus(newStatus);
        ticket.setUpdatedAt(LocalDateTime.now());
        if (newStatus == TicketStatus.RESOLVED || newStatus == TicketStatus.CLOSED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }
        Ticket savedTicket = ticketRepository.save(ticket);

        TicketStatusHistory history = new TicketStatusHistory();
        history.setTicket(savedTicket);
        history.setOldStatus(oldStatus != null ? oldStatus.name() : null);
        history.setNewStatus(newStatus.name());
        history.setChangedBy(changedBy);
        history.setChangedAt(LocalDateTime.now());
        ticketStatusHistoryRepository.save(history);

        createNotificationForStatusChange(savedTicket, newStatus);
        return mapToResponseDTO(savedTicket);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponseDTO> getTicketsByCreator(Long creatorId) {
        findUserById(creatorId);
        return ticketRepository.findByCreatedById(creatorId)
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponseDTO> getTicketsByAssignee(Long assigneeId) {
        findUserById(assigneeId);
        return ticketRepository.findByAssignedToId(assigneeId)
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    private Ticket findTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    private User findNullableUserById(Long id) {
        if (id == null) {
            return null;
        }
        return findUserById(id);
    }

    private TicketCategory findCategoryById(Long id) {
        return ticketCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket category not found with id: " + id));
    }

    private TicketCategory findNullableCategoryById(Long id) {
        if (id == null) {
            return null;
        }
        return findCategoryById(id);
    }
    @Override
    public List<TicketAssignmentHistoryResponseDTO> getAssignmentHistory(Long ticketId) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        return mapAssignmentHistory(ticket.getAssignmentHistory());
    }

    @Override
    public List<TicketStatusHistoryResponseDTO> getStatusHistory(Long ticketId) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        return mapStatusHistory(ticket.getStatusHistory());
    }
    
    private void createNotificationForTicketCreation(Ticket ticket) {
        if (ticket.getCreatedBy() == null) {
            return;
        }

        notificationService.create(new NotificationCreateDTO(
                "Ticket created",
                "Your ticket has been created successfully.",
                "TICKET_CREATED",
                ticket.getCreatedBy().getId(),
                ticket.getId()
        ));

        if (ticket.getAssignedTo() != null && !ticket.getAssignedTo().getId().equals(ticket.getCreatedBy().getId())) {
            notificationService.create(new NotificationCreateDTO(
                    "New ticket assigned",
                    "A new ticket has been assigned to you.",
                    "TICKET_ASSIGNED",
                    ticket.getAssignedTo().getId(),
                    ticket.getId()
            ));
        }
    }

    private void createNotificationForAssignment(Ticket ticket, User oldAssignee, User newAssignee, User assignedBy) {
        if (newAssignee != null) {
            notificationService.create(new NotificationCreateDTO(
                    "Ticket assigned",
                    "You have been assigned to ticket " + ticket.getTicketNumber() + ".",
                    "TICKET_ASSIGNED",
                    newAssignee.getId(),
                    ticket.getId()
            ));
        }

        if (assignedBy != null && oldAssignee != null && (newAssignee == null || !oldAssignee.getId().equals(newAssignee.getId()))) {
            notificationService.create(new NotificationCreateDTO(
                    "Ticket reassigned",
                    "Ticket " + ticket.getTicketNumber() + " was reassigned.",
                    "TICKET_REASSIGNED",
                    assignedBy.getId(),
                    ticket.getId()
            ));
        }
    }

    private void createNotificationForStatusChange(Ticket ticket, TicketStatus newStatus) {
        if (newStatus == null) {
            return;
        }

        String title = switch (newStatus) {
            case RESOLVED -> "Ticket resolved";
            case CLOSED -> "Ticket closed";
            default -> "Ticket status updated";
        };

        String message = "Ticket " + ticket.getTicketNumber() + " is now " + newStatus.name() + ".";
        String type = newStatus == TicketStatus.RESOLVED ? "TICKET_RESOLVED" : "TICKET_STATUS_CHANGED";

        if (ticket.getAssignedTo() != null) {
            notificationService.create(new NotificationCreateDTO(
                    title,
                    message,
                    type,
                    ticket.getAssignedTo().getId(),
                    ticket.getId()
            ));
        }

        if (ticket.getCreatedBy() != null && !ticket.getCreatedBy().getId().equals(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getId() : null)) {
            notificationService.create(new NotificationCreateDTO(
                    title,
                    message,
                    type,
                    ticket.getCreatedBy().getId(),
                    ticket.getId()
            ));
        }
    }

    private TicketResponseDTO mapToResponseDTO(Ticket ticket) {
        User createdBy = ticket.getCreatedBy();
        User assignedTo = ticket.getAssignedTo();
        TicketCategory category = ticket.getCategory();
        return new TicketResponseDTO(
                ticket.getId(),
                ticket.getTicketNumber(),
                ticket.getSubject(),
                ticket.getDescription(),
                ticket.getStatus(),
                ticket.getPriority(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt(),
                ticket.getResolvedAt(),
                createdBy != null ? createdBy.getId() : null,
                getUserFullName(createdBy),
                assignedTo != null ? assignedTo.getId() : null,
                getUserFullName(assignedTo),
                category != null ? category.getId() : null,
                category != null ? category.getName() : null,
                mapComments(ticket.getComments()),
                mapAttachments(ticket.getAttachments()),
                mapStatusHistory(ticket.getStatusHistory()),
                mapAssignmentHistory(ticket.getAssignmentHistory())
        );
    }

    private List<TicketCommentResponseDTO> mapComments(List<TicketComment> comments) {
        if (comments == null) {
            return List.of();
        }
        return comments.stream()
                .map(comment -> new TicketCommentResponseDTO(
                        comment.getId(),
                        comment.getComment(),
                        comment.getCommentedAt(),
                        comment.getTicket() != null ? comment.getTicket().getId() : null,
                        comment.getUser() != null ? comment.getUser().getId() : null,
                        getUserFullName(comment.getUser())
                ))
                .toList();
    }

    private List<TicketAttachmentResponseDTO> mapAttachments(List<TicketAttachment> attachments) {
        if (attachments == null) {
            return List.of();
        }
        return attachments.stream()
                .map(attachment -> new TicketAttachmentResponseDTO(
                        attachment.getId(),
                        attachment.getFileName(),
                        attachment.getFilePath(),
                        attachment.getFileSize(),
                        attachment.getUploadedAt(),
                        attachment.getTicket() != null ? attachment.getTicket().getId() : null,
                        attachment.getUploadedBy() != null ? attachment.getUploadedBy().getId() : null,
                        getUserFullName(attachment.getUploadedBy())
                ))
                .toList();
    }

    private List<TicketStatusHistoryResponseDTO> mapStatusHistory(List<TicketStatusHistory> statusHistory) {
        if (statusHistory == null) {
            return List.of();
        }
        return statusHistory.stream()
                .map(history -> new TicketStatusHistoryResponseDTO(
                        history.getId(),
                        history.getTicket() != null ? history.getTicket().getId() : null,
                        history.getOldStatus(),
                        history.getNewStatus(),
                        history.getChangedBy() != null ? history.getChangedBy().getId() : null,
                        getUserFullName(history.getChangedBy()),
                        history.getChangedAt()
                ))
                .toList();
    }

    private List<TicketAssignmentHistoryResponseDTO> mapAssignmentHistory(List<TicketAssignmentHistory> assignmentHistory) {
        if (assignmentHistory == null) {
            return List.of();
        }
        return assignmentHistory.stream()
                .map(history -> new TicketAssignmentHistoryResponseDTO(
                        history.getId(),
                        history.getTicket() != null ? history.getTicket().getId() : null,
                        history.getOldAssignee() != null ? history.getOldAssignee().getId() : null,
                        getUserFullName(history.getOldAssignee()),
                        history.getNewAssignee() != null ? history.getNewAssignee().getId() : null,
                        getUserFullName(history.getNewAssignee()),
                        history.getAssignedBy() != null ? history.getAssignedBy().getId() : null,
                        getUserFullName(history.getAssignedBy()),
                        history.getAssignedAt()
                ))
                .toList();
    }

    private String generateTicketNumber() {
        return "TICKET-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String getUserFullName(User user) {
        if (user == null) {
            return null;
        }
        return user.getFirstName() + " " + user.getLastName();
    }
}
