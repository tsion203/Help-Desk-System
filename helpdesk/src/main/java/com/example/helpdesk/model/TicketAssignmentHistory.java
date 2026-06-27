package com.example.helpdesk.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ticket_assignment_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TicketAssignmentHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "old_assignee_id")
    private User oldAssignee;

    @ManyToOne
    @JoinColumn(name = "new_assignee_id")
    private User newAssignee;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @ManyToOne
    @JoinColumn(name = "tickets_id")
    private Ticket ticket;

    @ManyToOne
    @JoinColumn(name = "assigned_by")
    private User assignedBy;
}
