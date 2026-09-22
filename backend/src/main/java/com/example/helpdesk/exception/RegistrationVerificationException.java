package com.example.helpdesk.exception;

import org.springframework.http.HttpStatus;

public class RegistrationVerificationException extends RuntimeException {
    private final HttpStatus status;
    public RegistrationVerificationException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }
    public HttpStatus getStatus() { return status; }
}
