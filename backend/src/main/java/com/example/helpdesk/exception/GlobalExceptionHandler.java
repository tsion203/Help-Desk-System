package com.example.helpdesk.exception;

import java.time.OffsetDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import com.example.helpdesk.dto.ApiErrorResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        return respond(ex, request, HttpStatus.FORBIDDEN, "FORBIDDEN", "You do not have permission to perform this action.");
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleBadCredentials(BadCredentialsException ex, HttpServletRequest request) {
        return respond(ex, request, HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Email or password is incorrect.");
    }

    @ExceptionHandler(CurrentPasswordException.class)
    public ResponseEntity<ApiErrorResponse> handleCurrentPassword(CurrentPasswordException ex, HttpServletRequest request) {
        return respond(ex, request, HttpStatus.BAD_REQUEST, "CURRENT_PASSWORD_INCORRECT", "Current password is incorrect.");
    }

    @ExceptionHandler(PasswordResetException.class)
    public ResponseEntity<ApiErrorResponse> handlePasswordReset(PasswordResetException ex, HttpServletRequest request) {
        String technical = ex.getMessage() == null ? "" : ex.getMessage().toLowerCase();
        String message = technical.contains("expired") ? "This password reset link has expired."
                : technical.contains("already") || technical.contains("used") ? "This password reset link has already been used."
                : technical.contains("match") ? "Passwords do not match."
                : "This password reset link is invalid.";
        return respond(ex, request, HttpStatus.BAD_REQUEST, "PASSWORD_RESET_INVALID", message);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiErrorResponse> handleConflict(ConflictException ex, HttpServletRequest request) {
        return respond(ex, request, HttpStatus.CONFLICT, "RESOURCE_CONFLICT", ex.getMessage());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        return respond(ex, request, HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", "The requested resource was not found.");
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, ConstraintViolationException.class})
    public ResponseEntity<ApiErrorResponse> handleValidation(Exception ex, HttpServletRequest request) {
        String message = "Please fill in all required fields.";
        if (ex instanceof MethodArgumentNotValidException validationException
                && validationException.getBindingResult().getFieldErrors().stream()
                        .anyMatch(error -> "categoryId".equals(error.getField()))) {
            message = "Please select a ticket category.";
        }
        return respond(ex, request, HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", message);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class})
    public ResponseEntity<ApiErrorResponse> handleInvalidRequest(Exception ex, HttpServletRequest request) {
        return respond(ex, request, HttpStatus.BAD_REQUEST, "INVALID_REQUEST", "The request contains an invalid value.");
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> handleMethodNotAllowed(Exception ex, HttpServletRequest request) {
        return respond(ex, request, HttpStatus.METHOD_NOT_ALLOWED, "METHOD_NOT_ALLOWED", "This action is not supported.");
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> handleMediaType(Exception ex, HttpServletRequest request) {
        return respond(ex, request, HttpStatus.UNSUPPORTED_MEDIA_TYPE, "UNSUPPORTED_MEDIA_TYPE", "The uploaded content type is not supported.");
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiErrorResponse> handleUploadSize(Exception ex, HttpServletRequest request) {
        return respond(ex, request, HttpStatus.PAYLOAD_TOO_LARGE, "FILE_TOO_LARGE", "The selected file is too large.");
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex, HttpServletRequest request) {
        return respond(ex, request, HttpStatus.CONFLICT, "RESOURCE_IN_USE",
                "This item cannot be changed because it is currently in use.");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
        return respond(ex, request, HttpStatus.BAD_REQUEST, "INVALID_REQUEST", "The request contains an invalid value.");
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalState(IllegalStateException ex, HttpServletRequest request) {
        return respond(ex, request, HttpStatus.CONFLICT, "ACTION_NOT_ALLOWED", "This action cannot be completed right now.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(Exception ex, HttpServletRequest request) {
        return respond(ex, request, HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
                "Something went wrong. Please try again.");
    }

    private ResponseEntity<ApiErrorResponse> respond(Throwable ex, HttpServletRequest request,
            HttpStatus status, String code, String message) {
        if (status.is5xxServerError()) LOGGER.error("Request {} {} failed with HTTP {}", request.getMethod(), request.getRequestURI(), status.value(), ex);
        else LOGGER.warn("Request {} {} failed with HTTP {}", request.getMethod(), request.getRequestURI(), status.value(), ex);
        return ResponseEntity.status(status).body(new ApiErrorResponse(
                OffsetDateTime.now(), status.value(), code, message));
    }
}
