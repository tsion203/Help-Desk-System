package com.example.helpdesk.repository;

public interface TicketAssigneeOptionProjection {
    Long getId();
    String getFirstName();
    String getLastName();
    Long getActiveTicketCount();
}
