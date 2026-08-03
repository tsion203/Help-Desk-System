package com.example.helpdesk.exception;

public class PasswordResetException extends RuntimeException {
    public PasswordResetException(String message) {
        super(message);
    }
}
