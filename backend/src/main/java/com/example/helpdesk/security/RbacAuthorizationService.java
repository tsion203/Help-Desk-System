package com.example.helpdesk.security;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.example.helpdesk.repository.TicketRepository;
import com.example.helpdesk.repository.UserRepository;
import com.example.helpdesk.repository.TicketAttachmentRepository;

@Component("rbac")
public class RbacAuthorizationService {
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketAttachmentRepository attachmentRepository;

    public RbacAuthorizationService(TicketRepository ticketRepository, UserRepository userRepository,
            TicketAttachmentRepository attachmentRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.attachmentRepository = attachmentRepository;
    }

    public boolean canAccessAttachment(Long attachmentId, Authentication authentication) {
        return attachmentId != null && attachmentRepository.findById(attachmentId)
                .map(attachment -> attachment.getTicket() != null
                        && canAccessTicket(attachment.getTicket().getId(), authentication)).orElse(false);
    }

    public boolean canDeleteAttachment(Long attachmentId, Authentication authentication) {
        if (hasAnyRole(authentication, "ADMIN")) return true;
        return hasAnyRole(authentication, "EMPLOYEE") && canAccessAttachment(attachmentId, authentication);
    }

    public boolean isCurrentUser(Long userId, Authentication authentication) {
        return authentication != null && userId != null && userRepository.findByEmail(authentication.getName())
                .map(user -> userId.equals(user.getId())).orElse(false);
    }

    public boolean canAccessTicket(Long ticketId, Authentication authentication) {
        if (hasAnyRole(authentication, "ADMIN", "SUPERVISOR")) return true;
        if (authentication == null || ticketId == null) return false;
        return ticketRepository.findById(ticketId).map(ticket ->
                ticket.getCreatedBy() != null && authentication.getName().equals(ticket.getCreatedBy().getEmail())
                || ticket.getAssignedTo() != null && authentication.getName().equals(ticket.getAssignedTo().getEmail()))
                .orElse(false);
    }

    public boolean canUpdateTicket(Long ticketId, Authentication authentication) {
        if (hasAnyRole(authentication, "ADMIN", "SUPERVISOR", "SUPPORT_OFFICER")) return false;
        if (!hasAnyRole(authentication, "EMPLOYEE") || authentication == null) return false;
        return ticketRepository.findById(ticketId).map(ticket ->
                ticket.getCreatedBy() != null
                        && authentication.getName().equals(ticket.getCreatedBy().getEmail()))
                .orElse(false);
    }

    public boolean canManageTicketAssignment(Long ticketId, Authentication authentication) {
        return hasAnyRole(authentication, "ADMIN", "SUPERVISOR")
                && canAccessTicket(ticketId, authentication);
    }

    public boolean canUpdateAssignedTicketStatus(Long ticketId, Authentication authentication) {
        if (!hasAnyRole(authentication, "SUPPORT_OFFICER") || authentication == null || ticketId == null) return false;
        return userRepository.findByEmail(authentication.getName())
                .flatMap(currentUser -> ticketRepository.findById(ticketId)
                        .map(ticket -> ticket.getAssignedTo() != null
                                && currentUser.getId().equals(ticket.getAssignedTo().getId())))
                .orElse(false);
    }

    public boolean canRejectAssignedTicket(Long ticketId, Authentication authentication) {
        if (authentication == null || ticketId == null) return false;
        return ticketRepository.findById(ticketId)
                .map(ticket -> ticket.getAssignedTo() != null
                        && authentication.getName().equals(ticket.getAssignedTo().getEmail()))
                .orElse(false);
    }

    public boolean canDeleteTicket(Long ticketId, Authentication authentication) {
        if (hasAnyRole(authentication, "ADMIN")) return true;
        if (!hasAnyRole(authentication, "EMPLOYEE") || authentication == null) return false;
        return ticketRepository.findById(ticketId)
                .map(ticket -> ticket.getCreatedBy() != null
                        && authentication.getName().equals(ticket.getCreatedBy().getEmail()))
                .orElse(false);
    }

    private boolean hasAnyRole(Authentication authentication, String... roles) {
        if (authentication == null) return false;
        for (String role : roles) {
            if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_" + role))) return true;
        }
        return false;
    }
}
