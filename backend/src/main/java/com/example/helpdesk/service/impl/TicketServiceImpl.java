package com.example.helpdesk.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.helpdesk.dto.NotificationCreateDTO;
import com.example.helpdesk.dto.TicketAssignmentHistoryResponseDTO;
import com.example.helpdesk.dto.TicketAssigneeOptionDTO;
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
import com.example.helpdesk.model.TicketPriority;
import com.example.helpdesk.model.TicketStatusHistory;
import com.example.helpdesk.model.User;
import com.example.helpdesk.repository.TicketAssignmentHistoryRepository;
import com.example.helpdesk.repository.TicketCategoryRepository;
import com.example.helpdesk.repository.TicketRepository;
import com.example.helpdesk.repository.TicketStatusHistoryRepository;
import com.example.helpdesk.repository.UserRepository;
import com.example.helpdesk.exception.ConflictException;
import com.example.helpdesk.service.EmailService;
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
    private final EmailService emailService;

    public TicketServiceImpl(
            TicketRepository ticketRepository,
            UserRepository userRepository,
            TicketCategoryRepository ticketCategoryRepository,
            TicketAssignmentHistoryRepository ticketAssignmentHistoryRepository,
            TicketStatusHistoryRepository ticketStatusHistoryRepository,
            NotificationService notificationService,
            EmailService emailService
    ) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.ticketCategoryRepository = ticketCategoryRepository;
        this.ticketAssignmentHistoryRepository = ticketAssignmentHistoryRepository;
        this.ticketStatusHistoryRepository = ticketStatusHistoryRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public TicketResponseDTO create(TicketCreateDTO ticketCreateDTO) {
        if (ticketCreateDTO.getStatus() == TicketStatus.CLOSED
                || ticketCreateDTO.getStatus() == TicketStatus.REOPENED) {
            throw new ConflictException("New tickets cannot be created as closed or reopened.");
        }
        Ticket ticket = new Ticket();
        ticket.setTicketNumber(generateTicketNumber());
        ticket.setSubject(ticketCreateDTO.getSubject());
        ticket.setDescription(ticketCreateDTO.getDescription());
        ticket.setStatus(ticketCreateDTO.getStatus() != null ? ticketCreateDTO.getStatus() : TicketStatus.OPEN);
        ticket.setPriority(ticketCreateDTO.getPriority());
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        User currentUser = findCurrentUserOrNull();
        ticket.setCreatedBy(currentUser != null ? currentUser : findUserById(ticketCreateDTO.getCreatedById()));
        ticket.setAssignedTo(hasAnyCurrentRole("ADMIN") ? findNullableUserById(ticketCreateDTO.getAssignedToId()) : null);
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
        return getAll(null, null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponseDTO> getAll(TicketStatus status, String category, TicketPriority priority) {
        return getAll(status, category, priority, Pageable.unpaged()).getContent();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TicketResponseDTO> getAll(TicketStatus status, String category, TicketPriority priority, Pageable pageable) {
        User currentUser = findCurrentUserOrNull();
        Specification<Ticket> specification = buildTicketSpecification(status, category, priority);

        if (hasAnyCurrentRole("ADMIN", "SUPERVISOR")) {
            // Administrators and supervisors retain visibility of all filtered tickets.
        } else if (currentUser != null && hasAnyCurrentRole("SUPPORT_OFFICER")) {
            Long currentUserId = currentUser.getId();
            specification = specification.and(assignedToIdEquals(currentUserId));
        } else if (currentUser != null) {
            Long currentUserId = currentUser.getId();
            specification = specification.and(createdByIdEquals(currentUserId));
        } else {
            return Page.empty(pageable);
        }

        return ticketRepository.findAll(specification, pageable).map(this::mapToResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TicketResponseDTO> getCreatedTicketsForCurrentUser(TicketStatus status, String category, TicketPriority priority, Pageable pageable) {
        User currentUser = requireCurrentUser();
        Specification<Ticket> specification = buildTicketSpecification(status, category, priority)
                .and(createdByIdEquals(currentUser.getId()));
        return ticketRepository.findAll(specification, pageable).map(this::mapToResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TicketResponseDTO> getAssignedTicketsForCurrentUser(TicketStatus status, String category, TicketPriority priority, Pageable pageable) {
        User currentUser = requireCurrentUser();
        Specification<Ticket> specification = buildTicketSpecification(status, category, priority)
                .and(assignedToIdEquals(currentUser.getId()));
        return ticketRepository.findAll(specification, pageable).map(this::mapToResponseDTO);
    }

    @Override
    @Transactional
    public TicketResponseDTO rejectAssignedTicket(Long ticketId, String reason) {
        Ticket ticket = findTicketById(ticketId);
        requireMutable(ticket);
        User currentUser = requireCurrentUser();
        if (ticket.getAssignedTo() == null || !ticket.getAssignedTo().getId().equals(currentUser.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Only the assigned user can reject this ticket.");
        }

        TicketStatus oldStatus = ticket.getStatus();
        User oldAssignee = ticket.getAssignedTo();
        User assigningSupervisor = ticketAssignmentHistoryRepository
                .findFirstByTicketIdAndNewAssigneeIdOrderByAssignedAtDesc(ticketId, oldAssignee.getId())
                .map(TicketAssignmentHistory::getAssignedBy)
                .filter(user -> hasRole(user, "SUPERVISOR"))
                .orElse(null);
        ticket.setAssignedTo(null);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket savedTicket = ticketRepository.save(ticket);
        saveAssignmentHistory(savedTicket, oldAssignee, null, currentUser, reason.trim());
        if (oldStatus != TicketStatus.OPEN) {
            saveStatusHistory(savedTicket, oldStatus, TicketStatus.OPEN, currentUser);
            createNotificationForStatusChange(savedTicket, TicketStatus.OPEN);
        }
        if (assigningSupervisor != null) {
            notificationService.create(new NotificationCreateDTO(
                    "Ticket rejected",
                    savedTicket.getTicketNumber() + " — " + savedTicket.getSubject() + " was rejected by "
                            + getUserFullName(currentUser) + ". Reason: " + reason.trim(),
                    "TICKET_REJECTED",
                    assigningSupervisor.getId(),
                    savedTicket.getId()
            ));
        }
        return mapToResponseDTO(savedTicket);
    }

    private Specification<Ticket> buildTicketSpecification(TicketStatus status, String category, TicketPriority priority) {
        Specification<Ticket> specification = (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();

        if (status != null) {
            specification = specification.and((root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("status"), status));
        }
        if (priority != null) {
            specification = specification.and((root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("priority"), priority));
        }
        if (category != null && !category.isBlank()) {
            String normalizedCategory = category.trim().toLowerCase();
            specification = specification.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(criteriaBuilder.lower(root.join("category").get("name")), normalizedCategory));
        }
        return specification;
    }

    private Specification<Ticket> assignedToIdEquals(Long userId) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("assignedTo").get("id"), userId);
    }

    private Specification<Ticket> createdByIdEquals(Long userId) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("createdBy").get("id"), userId);
    }

    private User requireCurrentUser() {
        User user = findCurrentUserOrNull();
        if (user == null) {
            throw new org.springframework.security.access.AccessDeniedException("Authenticated user required.");
        }
        return user;
    }

    @Override
    @Transactional
    public TicketResponseDTO update(Long id, TicketUpdateDTO ticketUpdateDTO) {
        Ticket ticket = findTicketById(id);
        requireMutable(ticket);
        if (hasBeenReopened(ticket)
                && ticketUpdateDTO.getSubject() != null
                && !Objects.equals(ticket.getSubject(), ticketUpdateDTO.getSubject())) {
            throw new ConflictException("The subject cannot be changed after a ticket has been reopened.");
        }
        TicketStatus oldStatus = ticket.getStatus();
        if (ticketUpdateDTO.getStatus() == TicketStatus.REOPENED) {
            throw new ConflictException("Closed tickets must be reopened through the status action.");
        }
        if (ticketUpdateDTO.getStatus() == TicketStatus.CLOSED && oldStatus != TicketStatus.CLOSED) {
            requireRequester(ticket, requireCurrentUser(), "Only the ticket requester can close this ticket.");
        } else if (ticketUpdateDTO.getStatus() != null && ticketUpdateDTO.getStatus() != oldStatus) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Use the ticket status action to change this status.");
        }
        User oldAssignee = ticket.getAssignedTo();
        User newAssignee = oldAssignee;
        boolean assigneeChanged = false;
        boolean subjectChanged = ticketUpdateDTO.getSubject() != null && !Objects.equals(ticket.getSubject(), ticketUpdateDTO.getSubject());
        boolean descriptionChanged = ticketUpdateDTO.getDescription() != null && !Objects.equals(ticket.getDescription(), ticketUpdateDTO.getDescription());
        boolean priorityChanged = ticketUpdateDTO.getPriority() != null && ticket.getPriority() != ticketUpdateDTO.getPriority();
        boolean categoryChanged = ticketUpdateDTO.getCategoryId() != null
                && (ticket.getCategory() == null || !Objects.equals(ticket.getCategory().getId(), ticketUpdateDTO.getCategoryId()));

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
        if (ticketUpdateDTO.getAssignedToId() != null && hasAnyCurrentRole("ADMIN", "SUPERVISOR")) {
            if (ticketUpdateDTO.getAssignedToId() == 0) {
                assigneeChanged = oldAssignee != null;
                ticket.setAssignedTo(null);
                newAssignee = null;
                if (oldAssignee != null && ticket.getStatus() == TicketStatus.ASSIGNED) {
                    ticket.setStatus(TicketStatus.OPEN);
                }
            } else {
                newAssignee = requireSupportOfficer(ticketUpdateDTO.getAssignedToId());
                assigneeChanged = oldAssignee == null || !oldAssignee.getId().equals(newAssignee.getId());
                ticket.setAssignedTo(newAssignee);
                if (oldAssignee == null && ticket.getStatus() == TicketStatus.OPEN) {
                    ticket.setStatus(TicketStatus.ASSIGNED);
                }
            }
        }
        if (ticketUpdateDTO.getCategoryId() != null) {
            ticket.setCategory(findCategoryById(ticketUpdateDTO.getCategoryId()));
        }

        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket savedTicket = ticketRepository.save(ticket);

        User updatedBy = findCurrentUserOrNull();
        boolean statusChanged = ticket.getStatus() != oldStatus;
        if (statusChanged) {
            saveStatusHistory(savedTicket, oldStatus, ticket.getStatus(), updatedBy);
            createNotificationForStatusChange(savedTicket, ticket.getStatus());
        }
        if (assigneeChanged) {
            saveAssignmentHistory(savedTicket, oldAssignee, newAssignee, updatedBy, null);
            if (newAssignee != null) {
                emailService.sendTicketAssigned(savedTicket, newAssignee);
            }
        }
        notifyAssignedOfficerOfTicketUpdate(savedTicket, subjectChanged, descriptionChanged, categoryChanged, priorityChanged);
        return mapToResponseDTO(savedTicket);
    }

    @Override
    @Transactional
    public TicketResponseDTO updateAssignment(Long ticketId, Long assigneeId) {
        Ticket ticket = findTicketById(ticketId);
        requireMutable(ticket);
        User oldAssignee = ticket.getAssignedTo();
        User newAssignee = assigneeId == 0 ? null : requireSupportOfficer(assigneeId);

        if (newAssignee != null && ticket.getCreatedBy() != null
                && newAssignee.getId().equals(ticket.getCreatedBy().getId())) {
            throw new ConflictException("The ticket requester cannot be assigned to their own ticket.");
        }

        boolean assigneeChanged = oldAssignee == null
                ? newAssignee != null
                : newAssignee == null || !oldAssignee.getId().equals(newAssignee.getId());
        if (!assigneeChanged) {
            return mapToResponseDTO(ticket);
        }

        TicketStatus oldStatus = ticket.getStatus();
        ticket.setAssignedTo(newAssignee);
        if (oldAssignee == null && newAssignee != null
                && (oldStatus == TicketStatus.OPEN || oldStatus == TicketStatus.REOPENED)) {
            ticket.setStatus(TicketStatus.ASSIGNED);
        } else if (oldAssignee != null && newAssignee == null && oldStatus == TicketStatus.ASSIGNED) {
            ticket.setStatus(TicketStatus.OPEN);
        }
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket savedTicket = ticketRepository.save(ticket);
        User updatedBy = requireCurrentUser();
        saveAssignmentHistory(savedTicket, oldAssignee, newAssignee, updatedBy, null);
        if (savedTicket.getStatus() != oldStatus) {
            saveStatusHistory(savedTicket, oldStatus, savedTicket.getStatus(), updatedBy);
            createNotificationForStatusChange(savedTicket, savedTicket.getStatus());
        }
        if (newAssignee != null && savedTicket.getStatus() == oldStatus) {
            createNotificationForAssignment(savedTicket, oldAssignee, newAssignee, updatedBy);
        } else if (newAssignee != null) {
            emailService.sendTicketAssigned(savedTicket, newAssignee);
        }
        return mapToResponseDTO(savedTicket);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketAssigneeOptionDTO> getAssignmentCandidates(Long ticketId) {
        Ticket ticket = findTicketById(ticketId);
        if (ticket.getCreatedBy() == null) {
            return List.of();
        }
        return userRepository.findTicketAssigneeOptionsExcludingRequester(ticket.getCreatedBy().getId()).stream()
                .map(option -> new TicketAssigneeOptionDTO(
                        option.getId(),
                        option.getFirstName(),
                        option.getLastName(),
                        option.getActiveTicketCount()))
                .toList();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Ticket ticket = findTicketById(id);
        requireMutable(ticket);
        User assignedOfficer = ticket.getAssignedTo();
        String reference = ticket.getTicketNumber() + " — " + ticket.getSubject();
        ticketRepository.delete(ticket);
        if (assignedOfficer != null) {
            notificationService.create(new NotificationCreateDTO(
                    "Ticket deleted",
                    reference + " was deleted.",
                    "TICKET_DELETED",
                    assignedOfficer.getId(),
                    null
            ));
        }
    }

    @Override
    @Transactional
    public TicketResponseDTO assignTicket(Long ticketId, Long assigneeId, Long assignedById) {
        Ticket ticket = findTicketById(ticketId);
        requireMutable(ticket);
        User oldAssignee = ticket.getAssignedTo();
        User newAssignee = findUserById(assigneeId);
        User assignedBy = findUserById(assignedById);

        ticket.setAssignedTo(newAssignee);
        ticket.setStatus(TicketStatus.ASSIGNED);
        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket savedTicket = ticketRepository.save(ticket);

        saveAssignmentHistory(savedTicket, oldAssignee, newAssignee, assignedBy, null);

        createNotificationForAssignment(savedTicket, oldAssignee, newAssignee, assignedBy);
        return mapToResponseDTO(savedTicket);
    }

    @Override
    @Transactional
    public TicketResponseDTO changeStatus(Long ticketId, TicketStatus newStatus, Long changedById) {
        User currentUser = requireCurrentUser();
        if (changedById == null || !currentUser.getId().equals(changedById)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "The authenticated user must perform the status change.");
        }
        return changeStatusForCurrentUser(ticketId, newStatus);
    }

    private TicketResponseDTO persistStatusChange(Long ticketId, TicketStatus newStatus, User changedBy) {
        Ticket ticket = findTicketById(ticketId);
        TicketStatus oldStatus = ticket.getStatus();

        ticket.setStatus(newStatus);
        ticket.setUpdatedAt(LocalDateTime.now());
        if (newStatus == TicketStatus.RESOLVED || newStatus == TicketStatus.CLOSED) {
            ticket.setResolvedAt(LocalDateTime.now());
        } else if (newStatus == TicketStatus.REOPENED) {
            ticket.setResolvedAt(null);
        }
        Ticket savedTicket = ticketRepository.save(ticket);

        saveStatusHistory(savedTicket, oldStatus, newStatus, changedBy);

        createNotificationForStatusChange(savedTicket, newStatus);
        return mapToResponseDTO(savedTicket);
    }

    @Override
    @Transactional
    public TicketResponseDTO changeStatusForCurrentUser(Long ticketId, TicketStatus newStatus) {
        Ticket ticket = findTicketById(ticketId);
        User currentUser = requireCurrentUser();

        if (newStatus == TicketStatus.REOPENED) {
            requireReopenAllowed(ticket, currentUser);
        } else if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new ConflictException("A closed ticket can only be reopened by the requester who closed it.");
        } else if (newStatus == TicketStatus.CLOSED) {
            requireRequester(ticket, currentUser, "Only the ticket requester can close this ticket.");
        } else if (ticket.getAssignedTo() == null
                || !ticket.getAssignedTo().getId().equals(currentUser.getId())
                || !hasRole(currentUser, "SUPPORT_OFFICER")) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Only the assigned Support Officer can update this ticket's status.");
        }
        return persistStatusChange(ticketId, newStatus, currentUser);
    }

    private void requireReopenAllowed(Ticket ticket, User currentUser) {
        if (ticket.getStatus() != TicketStatus.CLOSED) {
            throw new ConflictException("Only a closed ticket can be reopened.");
        }
        requireRequester(ticket, currentUser, "Only the requester who closed this ticket can reopen it.");
        TicketStatusHistory closingEntry = ticketStatusHistoryRepository
                .findFirstByTicketIdAndNewStatusOrderByChangedAtDesc(ticket.getId(), TicketStatus.CLOSED.name())
                .orElseThrow(() -> new ConflictException("This ticket has no closing audit record and cannot be reopened."));
        if (closingEntry.getChangedBy() == null
                || !currentUser.getId().equals(closingEntry.getChangedBy().getId())) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Only the requester who closed this ticket can reopen it.");
        }
    }

    private void requireRequester(Ticket ticket, User currentUser, String message) {
        if (ticket.getCreatedBy() == null || !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new org.springframework.security.access.AccessDeniedException(message);
        }
    }

    private void requireMutable(Ticket ticket) {
        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new ConflictException("Closed tickets cannot be modified.");
        }
    }

    private boolean hasBeenReopened(Ticket ticket) {
        return ticketStatusHistoryRepository.existsByTicketIdAndNewStatus(
                ticket.getId(), TicketStatus.REOPENED.name());
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

    private User requireSupportOfficer(Long id) {
        User user = findUserById(id);
        if (!hasRole(user, "SUPPORT_OFFICER")) {
            throw new ConflictException("Tickets can only be assigned to Support Officers.");
        }
        return user;
    }

    private boolean hasRole(User user, String expectedRole) {
        return user != null && user.getRoles() != null && user.getRoles().stream()
                .filter(role -> role != null && role.getName() != null)
                .map(role -> role.getName().trim().toUpperCase()
                        .replaceFirst("^ROLE_", "").replace(' ', '_').replace('-', '_'))
                .anyMatch(expectedRole::equals);
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
    @Transactional(readOnly = true)
    public List<TicketAssignmentHistoryResponseDTO> getAssignmentHistory(Long ticketId) {
        findTicketById(ticketId);
        return mapAssignmentHistory(ticketAssignmentHistoryRepository.findByTicketIdOrderByAssignedAtAsc(ticketId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketStatusHistoryResponseDTO> getStatusHistory(Long ticketId) {
        findTicketById(ticketId);
        return mapStatusHistory(ticketStatusHistoryRepository.findByTicketIdOrderByChangedAtAsc(ticketId));
    }

    private void saveStatusHistory(Ticket ticket, TicketStatus oldStatus, TicketStatus newStatus, User changedBy) {
        TicketStatusHistory history = new TicketStatusHistory();
        history.setTicket(ticket);
        history.setOldStatus(oldStatus != null ? oldStatus.name() : null);
        history.setNewStatus(newStatus.name());
        history.setChangedBy(changedBy);
        history.setChangedAt(LocalDateTime.now());
        ticketStatusHistoryRepository.save(history);
    }

    private void saveAssignmentHistory(Ticket ticket, User oldAssignee, User newAssignee, User assignedBy, String reason) {
        TicketAssignmentHistory history = new TicketAssignmentHistory();
        history.setTicket(ticket);
        history.setOldAssignee(oldAssignee);
        history.setNewAssignee(newAssignee);
        history.setAssignedBy(assignedBy);
        history.setReason(reason);
        history.setAssignedAt(LocalDateTime.now());
        ticketAssignmentHistoryRepository.save(history);
    }

    private User findCurrentUserOrNull() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return null;
        }
        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }

    private boolean hasAnyCurrentRole(String... roles) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return false;
        for (String role : roles) {
            if (authentication.getAuthorities().stream()
                    .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role))) return true;
        }
        return false;
    }

    private void notifyAssignedOfficerOfTicketUpdate(
            Ticket ticket,
            boolean subjectChanged,
            boolean descriptionChanged,
            boolean categoryChanged,
            boolean priorityChanged) {
        if (ticket.getAssignedTo() == null) return;
        List<String> changes = new java.util.ArrayList<>();
        if (subjectChanged) changes.add("subject");
        if (descriptionChanged) changes.add("description");
        if (categoryChanged) changes.add("category");
        if (priorityChanged) changes.add("priority");
        if (changes.isEmpty()) return;

        String changedFields = String.join(", ", changes);
        notificationService.create(new NotificationCreateDTO(
                "Ticket updated",
                "The " + changedFields + " of your ticket " + ticket.getTicketNumber() + " — "
                        + ticket.getSubject() + " " + (changes.size() == 1 ? "was" : "were") + " updated.",
                "TICKET_UPDATED",
                ticket.getAssignedTo().getId(),
                ticket.getId()
        ));
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
        emailService.sendTicketCreated(ticket, ticket.getCreatedBy());

        userRepository.findAllActiveSupervisors().stream()
                .filter(supervisor -> !supervisor.getId().equals(ticket.getCreatedBy().getId()))
                .forEach(supervisor -> notificationService.create(new NotificationCreateDTO(
                        "New ticket created",
                        ticket.getTicketNumber() + " — " + ticket.getSubject() + " was created.",
                        "TICKET_CREATED_SUPERVISOR",
                        supervisor.getId(),
                        ticket.getId()
                )));

        if (ticket.getAssignedTo() != null && !ticket.getAssignedTo().getId().equals(ticket.getCreatedBy().getId())) {
            notificationService.create(new NotificationCreateDTO(
                    "New ticket assigned",
                    "This ticket has been assigned to you: " + ticket.getTicketNumber() + " — " + ticket.getSubject() + ".",
                    "TICKET_ASSIGNED",
                    ticket.getAssignedTo().getId(),
                    ticket.getId()
            ));
            emailService.sendTicketAssigned(ticket, ticket.getAssignedTo());
        }
    }

    private void createNotificationForAssignment(Ticket ticket, User oldAssignee, User newAssignee, User assignedBy) {
        if (newAssignee != null) {
            notificationService.create(new NotificationCreateDTO(
                    "Ticket assigned",
                    "This ticket has been assigned to you: " + ticket.getTicketNumber() + " — " + ticket.getSubject() + ".",
                    "TICKET_ASSIGNED",
                    newAssignee.getId(),
                    ticket.getId()
            ));
            emailService.sendTicketAssigned(ticket, newAssignee);
        }

        if (ticket.getCreatedBy() != null && newAssignee != null
                && !ticket.getCreatedBy().getId().equals(newAssignee.getId())) {
            notificationService.create(new NotificationCreateDTO(
                    "Ticket assigned",
                    "Your ticket " + ticket.getTicketNumber() + " — " + ticket.getSubject() + " has been assigned.",
                    "TICKET_ASSIGNED",
                    ticket.getCreatedBy().getId(),
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

        String officerMessage = newStatus == TicketStatus.ASSIGNED
                ? "This ticket has been assigned to you: " + ticket.getTicketNumber() + " — " + ticket.getSubject() + "."
                : "Ticket " + ticket.getTicketNumber() + " is now " + newStatus.name() + ".";
        String requesterMessage = newStatus == TicketStatus.ASSIGNED
                ? "Your ticket " + ticket.getTicketNumber() + " — " + ticket.getSubject() + " has been assigned."
                : "Ticket " + ticket.getTicketNumber() + " is now " + newStatus.name() + ".";
        String type = newStatus == TicketStatus.RESOLVED ? "TICKET_RESOLVED" : "TICKET_STATUS_CHANGED";

        if (ticket.getAssignedTo() != null) {
            notificationService.create(new NotificationCreateDTO(
                    title,
                    officerMessage,
                    type,
                    ticket.getAssignedTo().getId(),
                    ticket.getId()
            ));
            sendStatusEmail(ticket, ticket.getAssignedTo(), newStatus);
        }

        if (ticket.getCreatedBy() != null && !ticket.getCreatedBy().getId().equals(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getId() : null)) {
            notificationService.create(new NotificationCreateDTO(
                    title,
                    requesterMessage,
                    type,
                    ticket.getCreatedBy().getId(),
                    ticket.getId()
            ));
            sendStatusEmail(ticket, ticket.getCreatedBy(), newStatus);
        }
    }

    private void sendStatusEmail(Ticket ticket, User recipient, TicketStatus status) {
        if (status == TicketStatus.RESOLVED) {
            emailService.sendTicketResolved(ticket, recipient);
            return;
        }
        emailService.sendTicketStatusChanged(ticket, recipient);
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
                        history.getAssignedAt(),
                        history.getReason()
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
