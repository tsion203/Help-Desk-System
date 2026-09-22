package com.example.helpdesk.model;

import java.time.Instant;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/** Pending registration data is deliberately separate from authenticated users. */
@Entity
@Table(name = "registration_verifications")
@Getter
@Setter
public class RegistrationVerification {
    @Id
    private String id;
    @Column(nullable = false, unique = true)
    private String email;
    private String passwordHash;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Long departmentId;
    private boolean active;
    private String codeHash;
    private Instant expiresAt;
    private Instant lastSentAt;
    private Instant sendWindowStartedAt;
    private int sendCount;
    private int failedAttempts;
    private boolean used;
}
