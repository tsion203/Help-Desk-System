package com.example.helpdesk.service.impl;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.time.format.DateTimeFormatter;

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
    private static final DateTimeFormatter REPORT_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

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

    @Override
    @Transactional(readOnly = true)
    public byte[] generatePdfReportForCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !hasAnyRole(authentication, "ADMIN", "SUPERVISOR")) {
            throw new AccessDeniedException("Only administrators and supervisors can export dashboard reports.");
        }

        DashboardResponseDTO dashboard = getDashboardForCurrentUser();
        List<String> lines = new java.util.ArrayList<>();
        lines.add("Help Desk Ticket Report");
        lines.add("Generated: " + LocalDateTime.now().format(REPORT_DATE_FORMAT));
        lines.add("");
        lines.add("Total tickets: " + dashboard.totalTickets());
        lines.add("");
        lines.add("Tickets by status");
        Arrays.stream(TicketStatus.values()).forEach(status ->
                lines.add(formatLabel(status.name()) + ": " + dashboard.statusCounts().getOrDefault(status, 0L)));
        lines.add("");
        lines.add("Tickets by priority");
        Arrays.stream(TicketPriority.values()).forEach(priority ->
                lines.add(formatLabel(priority.name()) + ": " + dashboard.priorityCounts().getOrDefault(priority, 0L)));
        return createPdf(lines);
    }

    private byte[] createPdf(List<String> lines) {
        StringBuilder content = new StringBuilder("BT\n/F1 18 Tf\n50 790 Td\n");
        for (int index = 0; index < lines.size(); index++) {
            if (index == 1) content.append("/F1 10 Tf\n");
            if (index == 3 || index == 5 || index == 14) content.append("/F1 13 Tf\n");
            if (index == 4 || index == 6 || index == 15) content.append("/F1 10 Tf\n");
            content.append('(').append(escapePdfText(lines.get(index))).append(") Tj\n0 -24 Td\n");
        }
        content.append("ET\n");

        byte[] stream = content.toString().getBytes(StandardCharsets.ISO_8859_1);
        String[] objects = {
                "<< /Type /Catalog /Pages 2 0 R >>",
                "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
                "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
                "<< /Length " + stream.length + " >>\nstream\n" + new String(stream, StandardCharsets.ISO_8859_1) + "endstream",
                "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
        };

        ByteArrayOutputStream output = new ByteArrayOutputStream();
        writePdf(output, "%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n");
        int[] offsets = new int[objects.length + 1];
        for (int index = 0; index < objects.length; index++) {
            offsets[index + 1] = output.size();
            writePdf(output, (index + 1) + " 0 obj\n" + objects[index] + "\nendobj\n");
        }
        int xrefOffset = output.size();
        writePdf(output, "xref\n0 " + (objects.length + 1) + "\n0000000000 65535 f \n");
        for (int index = 1; index < offsets.length; index++) {
            writePdf(output, String.format("%010d 00000 n \n", offsets[index]));
        }
        writePdf(output, "trailer\n<< /Size " + (objects.length + 1) + " /Root 1 0 R >>\nstartxref\n"
                + xrefOffset + "\n%%EOF\n");
        return output.toByteArray();
    }

    private void writePdf(ByteArrayOutputStream output, String value) {
        output.writeBytes(value.getBytes(StandardCharsets.ISO_8859_1));
    }

    private String escapePdfText(String value) {
        return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)");
    }

    private String formatLabel(String value) {
        String normalized = value.toLowerCase().replace('_', ' ');
        return Character.toUpperCase(normalized.charAt(0)) + normalized.substring(1);
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
