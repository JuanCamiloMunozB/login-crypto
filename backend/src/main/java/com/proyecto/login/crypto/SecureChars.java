package com.proyecto.login.crypto;

import java.util.Arrays;
import java.util.function.Consumer;
import java.util.function.Function;

/**
 * Runs an action over a transient password {@code char[]} and guarantees the array is
 * zeroed afterwards, even if the action throws.
 *
 * <p>Centralizes the {@code try/finally} erasure pattern so no call site can forget it
 * and so the cleanup logic lives in exactly one place.
 */
public final class SecureChars {

    private SecureChars() {
    }

    /** Converts the raw secret to a char[], runs the action, and erases the array. */
    public static <T> T use(String rawSecret, Function<char[], T> action) {
        char[] chars = rawSecret.toCharArray();
        try {
            return action.apply(chars);
        } finally {
            Arrays.fill(chars, '\0');
        }
    }

    /** Same as {@link #use(String, Function)} for actions that return no value. */
    public static void run(String rawSecret, Consumer<char[]> action) {
        use(rawSecret, chars -> {
            action.accept(chars);
            return null;
        });
    }
}
