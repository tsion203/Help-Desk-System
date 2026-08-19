package com.example.helpdesk.service.impl;

import java.util.Arrays;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;
import java.util.Comparator;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.helpdesk.dto.DashboardResponseDTO;
import com.example.helpdesk.dto.DashboardTicketActivityDTO;
import com.example.helpdesk.dto.SupportOfficerOverviewDTO;
import com.example.helpdesk.exception.ResourceNotFoundException;
import com.example.helpdesk.model.Ticket;
import com.example.helpdesk.model.TicketPriority;
import com.example.helpdesk.model.TicketStatus;
import com.example.helpdesk.model.User;
import com.example.helpdesk.repository.TicketRepository;
import com.example.helpdesk.repository.UserRepository;
import com.example.helpdesk.service.DashboardService;

@Service
public class DashboardServiceImpl implements DashboardService {
    private static final int RECENT_ACTIVITY_LIMIT = 10;

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public DashboardServiceImpl(TicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardResponseDTO getDashboardForCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new AccessDeniedException("Authentication is required.");
        }
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        boolean manager = hasAnyRole(authentication, "ADMIN", "SUPERVISOR");
        boolean supportOfficer = hasAnyRole(authentication, "SUPPORT_OFFICER");
        boolean employee = hasAnyRole(authentication, "EMPLOYEE");
        if (!manager && !supportOfficer && !employee) {
            throw new AccessDeniedException("Your role does not have dashboard access.");
        }

        List<Ticket> scopedTickets = manager
                ? ticketRepository.findAll(Sort.by(Sort.Direction.DESC, "updatedAt"))
                : supportOfficer
                        ? ticketRepository.findByAssignedToIdOrderByUpdatedAtDesc(currentUser.getId())
                        : ticketRepository.findByCreatedByIdOrderByUpdatedAtDesc(currentUser.getId());

        Map<TicketStatus, Long> statusCounts = new EnumMap<>(TicketStatus.class);
        Arrays.stream(TicketStatus.values()).forEach(status -> statusCounts.put(status, 0L));
        Map<TicketPriority, Long> priorityCounts = new EnumMap<>(TicketPriority.class);
        Arrays.stream(TicketPriority.values()).forEach(priority -> priorityCounts.put(priority, 0L));
        scopedTickets.forEach(ticket -> {
            statusCounts.computeIfPresent(ticket.getStatus(), (key, value) -> value + 1);
            priorityCounts.computeIfPresent(ticket.getPriority(), (key, value) -> value + 1);
        });

        List<DashboardTicketActivityDTO> recentActivity = manager ? List.of() : scopedTickets.stream()
                .map(this::toActivity)
                .sorted(Comparator.comparing(DashboardTicketActivityDTO::updatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(RECENT_ACTIVITY_LIMIT)
                .toList();
        List<SupportOfficerOverviewDTO> officers = hasAnyRole(authentication, "SUPERVISOR")
                ? userRepository.findAllActiveSupportOfficers().stream().map(this::toOfficerOverview).toList()
                : List.of();

        return new DashboardResponseDTO(scopedTickets.size(), statusCounts, priorityCounts, recentActivity, officers);
    }

    private SupportOfficerOverviewDTO toOfficerOverview(User officer) {
        List<Ticket> tickets = ticketRepository.findByAssignedToId(officer.getId());
        return new SupportOfficerOverviewDTO(
                officer.getId(), officer.getFirstName() + " " + officer.getLastName(), officer.getEmail(),
                count(tickets, TicketStatus.ASSIGNED), count(tickets, TicketStatus.IN_PROGRESS),
                count(tickets, TicketStatus.PENDING), count(tickets, TicketStatus.RESOLVED), tickets.size());
    }

    private long count(List<Ticket> tickets, TicketStatus status) {
        return tickets.stream().filter(ticket -> ticket.getStatus() == status).count();
    }

    private DashboardTicketActivityDTO toActivity(Ticket ticket) {
        return new DashboardTicketActivityDTO(ticket.getId(), ticket.getTicketNumber(), ticket.getSubject(),
                ticket.getStatus(), ticket.getPriority(), latestActivityAt(ticket));
    }

    private LocalDateTime latestActivityAt(Ticket ticket) {
        LocalDateTime latest = ticket.getUpdatedAt() != null ? ticket.getUpdatedAt() : ticket.getCreatedAt();
        if (ticket.getComments() != null) {
            latest = max(latest, ticket.getComments().stream().map(comment -> comment.getCommentedAt()).max(LocalDateTime::compareTo).orElse(null));
        }
        if (ticket.getAttachments() != null) {
            latest = max(latest, ticket.getAttachments().stream().map(attachment -> attachment.getUploadedAt()).max(LocalDateTime::compareTo).orElse(null));
        }
        if (ticket.getStatusHistory() != null) {
            latest = max(latest, ticket.getStatusHistory().stream().map(history -> history.getChangedAt()).max(LocalDateTime::compareTo).orElse(null));
        }
        if (ticket.getAssignmentHistory() != null) {
            latest = max(latest, ticket.getAssignmentHistory().stream().map(history -> history.getAssignedAt()).max(LocalDateTime::compareTo).orElse(null));
        }
        return latest;
    }

    private LocalDateTime max(LocalDateTime left, LocalDateTime right) {
        if (left == null) return right;
        if (right == null) return left;
        return left.isAfter(right) ? left : right;
    }

    private boolean hasAnyRole(Authentication authentication, String... roles) {
        return Arrays.stream(roles).anyMatch(role -> authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role)));
    }
}
