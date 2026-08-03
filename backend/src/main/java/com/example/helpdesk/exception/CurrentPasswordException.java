package com.example.helpdesk.exception;

public class CurrentPasswordException extends RuntimeException {
    public CurrentPasswordException(String message) {
        super(message);
    }
}
