package com.example.helpdesk.service;

import com.example.helpdesk.model.Ticket;
import com.example.helpdesk.model.TicketComment;
import com.example.helpdesk.model.User;

public interface EmailService {

    void sendTicketCreated(Ticket ticket, User recipient);

    void sendTicketAssigned(Ticket ticket, User recipient);

    void sendTicketStatusChanged(Ticket ticket, User recipient);

    void sendTicketResolved(Ticket ticket, User recipient);

    void sendCommentAdded(Ticket ticket, TicketComment comment, User recipient);
}
