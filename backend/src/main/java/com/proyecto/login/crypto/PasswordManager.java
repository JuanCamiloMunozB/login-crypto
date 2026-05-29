package com.proyecto.login.crypto;

import org.springframework.stereotype.Component;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;

/**
 * Handles password hashing and verification using PBKDF2 (Java Cryptography Architecture).
 * Salt and hash are stored as Base64-encoded strings.
 */
@Component
public class PasswordManager {

    private static final String ALGORITHM = "PBKDF2WithHmacSHA256";
    private static final int SALT_LENGTH = 16;    // bytes
    private static final int KEY_LENGTH = 256;    // bits
    public static final int ITERATIONS = 210_000; // OWASP recommended work factor

    private final SecureRandom random = new SecureRandom();

    /** Generates a cryptographically secure random salt encoded in Base64. */
    public String generateSaltBase64() {
        byte[] salt = new byte[SALT_LENGTH];
        random.nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }

    /**
     * Generates a fresh salt and derives the hash using the current work factor.
     * Single entry point for creating a credential so callers never duplicate the
     * salt-generation / iteration-count logic.
     */
    public HashedPassword hash(char[] password) {
        String salt = generateSaltBase64();
        String hash = hashPassword(password, salt, ITERATIONS);
        return new HashedPassword(hash, salt, ITERATIONS);
    }

    /**
     * Derives the password hash using PBKDF2.
     * Uses char[] instead of String so the password can be zeroed from memory after use.
     */
    public String hashPassword(char[] password, String saltBase64, int iterations) {
        byte[] salt = Base64.getDecoder().decode(saltBase64);
        PBEKeySpec spec = new PBEKeySpec(password, salt, iterations, KEY_LENGTH);
        try {
            SecretKeyFactory factory = SecretKeyFactory.getInstance(ALGORITHM);
            byte[] hash = factory.generateSecret(spec).getEncoded();
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new IllegalStateException("Failed to derive password hash", e);
        } finally {
            spec.clearPassword();
        }
    }

    /**
     * Verifies a plaintext password against a stored hash.
     * Uses constant-time comparison to prevent timing attacks.
     */
    public boolean verify(char[] password, String saltBase64,
                          int iterations, String storedHashBase64) {
        if (storedHashBase64 == null) return false;
        String computedHash = hashPassword(password, saltBase64, iterations);
        return MessageDigest.isEqual(
                Base64.getDecoder().decode(computedHash),
                Base64.getDecoder().decode(storedHashBase64));
    }
}
