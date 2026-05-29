package com.proyecto.login.crypto;

import org.springframework.stereotype.Component;

/**
 * Centralized password strength policy.
 *
 * <p>Operates directly on {@code char[]} and never builds a {@link String} from the
 * plaintext, so the secret is not copied into the immutable String pool where it would
 * linger in memory until garbage collected.
 */
@Component
public class PasswordPolicy {

    private static final int MIN_LENGTH = 8;
    private static final int MAX_LENGTH = 128; // caps PBKDF2 work factor to prevent DoS via huge inputs

    /**
     * Validates the password against the policy.
     *
     * @throws IllegalArgumentException if the password is null or fails any rule
     */
    public void validate(char[] password) {
        if (password == null || password.length < MIN_LENGTH) {
            throw new IllegalArgumentException(
                    "Password must be at least " + MIN_LENGTH + " characters long");
        }
        if (password.length > MAX_LENGTH) {
            throw new IllegalArgumentException(
                    "Password must be at most " + MAX_LENGTH + " characters long");
        }

        boolean hasUpper = false;
        boolean hasLower = false;
        boolean hasDigit = false;
        for (char c : password) {
            if (Character.isUpperCase(c)) {
                hasUpper = true;
            } else if (Character.isLowerCase(c)) {
                hasLower = true;
            } else if (Character.isDigit(c)) {
                hasDigit = true;
            }
        }

        if (!hasUpper || !hasLower || !hasDigit) {
            throw new IllegalArgumentException(
                    "Password must contain an uppercase letter, a lowercase letter, and a digit");
        }
    }
}
