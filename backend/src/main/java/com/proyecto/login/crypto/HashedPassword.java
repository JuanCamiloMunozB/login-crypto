package com.proyecto.login.crypto;

/**
 * Immutable result of hashing a password: the derived hash, the salt used,
 * and the work factor (iteration count) applied.
 */
public record HashedPassword(String hash, String salt, int iterations) {}
