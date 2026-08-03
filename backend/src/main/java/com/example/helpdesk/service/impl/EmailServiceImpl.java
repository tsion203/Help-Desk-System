package com.example.helpdesk.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.example.helpdesk.model.Ticket;
import com.example.helpdesk.model.TicketComment;
import com.example.helpdesk.model.User;
import com.example.helpdesk.service.EmailService;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public EmailServiceImpl(
            JavaMailSender mailSender,
            @Value("${spring.mail.username:}") String fromAddress
    ) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    @Override
    public void sendTicketCreated(Ticket ticket, User recipient) {
        send(ticket, recipient,
                "Help Desk: Ticket " + ticket.getTicketNumber() + " created",
                "A new help desk ticket has been created.\n\n" + ticketDetails(ticket));
    }

    @Override
    public void sendTicketAssigned(Ticket ticket, User recipient) {
        send(ticket, recipient,
                "Help Desk: Ticket " + ticket.getTicketNumber() + " assigned to you",
                "A help desk ticket has been assigned to you.\n\n" + ticketDetails(ticket));
    }

    @Override
    public void sendTicketStatusChanged(Ticket ticket, User recipient) {
        send(ticket, recipient,
                "Help Desk: Ticket " + ticket.getTicketNumber() + " status updated",
                "The status of a help desk ticket has changed.\n\n" + ticketDetails(ticket));
    }

    @Override
    public void sendTicketResolved(Ticket ticket, User recipient) {
        send(ticket, recipient,
                "Help Desk: Ticket " + ticket.getTicketNumber() + " resolved",
                "Your help desk ticket has been resolved.\n\n" + ticketDetails(ticket));
    }

    @Override
    public void sendCommentAdded(Ticket ticket, TicketComment comment, User recipient) {
        String authorName = fullName(comment.getUser());
        send(ticket, recipient,
                "Help Desk: New comment on ticket " + ticket.getTicketNumber(),
                "A new comment was added to a help desk ticket.\n\n"
                        + ticketDetails(ticket)
                        + "\nComment by: " + authorName
                        + "\nComment: " + comment.getComment());
    }

    @Override
    public void sendPasswordReset(User recipient, String resetLink, long expiryMinutes) {
        String name = fullName(recipient).trim();
        String body = "Hello " + name + ",\n\n"
                + "We received a request to reset the password for your Help Desk account.\n\n"
                + "Use the link below to choose a new password:\n" + resetLink + "\n\n"
                + "This link expires in " + expiryMinutes + " minutes and can only be used once. "
                + "If you did not request a password reset, you can safely ignore this email.\n\n"
                + "Regards,\nHelp Desk Support";
        sendMessage(recipient, "Help Desk: Reset your password", body);
    }

    private void send(Ticket ticket, User recipient, String subject, String body) {
        if (recipient == null || !StringUtils.hasText(recipient.getEmail())) {
            LOGGER.warn("Email notification skipped for ticket {} because the recipient has no email address",
                    ticket != null ? ticket.getId() : null);
            return;
        }

        sendMessage(recipient, subject, body);
    }

    private void sendMessage(User recipient, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(recipient.getEmail());
            message.setSubject(subject);
            message.setText(body);
            if (StringUtils.hasText(fromAddress)) {
                message.setFrom(fromAddress);
            }
            mailSender.send(message);
        } catch (Exception exception) {
            LOGGER.error("Email notification failed for recipient {}", recipient.getEmail(), exception);
        }
    }

    private String ticketDetails(Ticket ticket) {
        return "Ticket: " + ticket.getTicketNumber()
                + "\nSubject: " + ticket.getSubject()
                + "\nStatus: " + ticket.getStatus()
                + "\nPriority: " + ticket.getPriority()
                + "\nDescription: " + ticket.getDescription();
    }

    private String fullName(User user) {
        if (user == null) {
            return "Unknown user";
        }
        return user.getFirstName() + " " + user.getLastName();
    }
}
