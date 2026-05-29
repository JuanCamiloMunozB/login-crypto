package com.proyecto.login.exception;

/**
 * Thrown when a request conflicts with existing state (e.g. a duplicate username).
 * Mapped to HTTP 409 Conflict by {@link ApiExceptionHandler}.
 */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
