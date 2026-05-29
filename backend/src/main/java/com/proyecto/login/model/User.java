package com.proyecto.login.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    /** PBKDF2 hash in Base64. Null when the password has been cleared by an admin. */
    @Column(length = 512)
    private String passwordHash;

    /** Random salt in Base64 used to derive the hash. */
    @Column(length = 256)
    private String salt;

    /** Iteration count used when deriving this hash. */
    private Integer iterations;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    /** Timestamp of the previous successful login (shown to the user). */
    private LocalDateTime lastLogin;

    /** Timestamp of the current session — promoted to lastLogin on the next login. */
    private LocalDateTime currentLogin;

    /** When true the account must set a new password before normal access. */
    @Builder.Default
    private boolean requiresPasswordChange = false;

    /**
     * Assigns a freshly derived credential and clears the password-change requirement.
     * Keeps credential mutation in the domain model and out of the service/crypto layers.
     */
    public void assignCredentials(String passwordHash, String salt, Integer iterations) {
        this.passwordHash = passwordHash;
        this.salt = salt;
        this.iterations = iterations;
        this.requiresPasswordChange = false;
    }

    /** Removes the stored credential, forcing the account to set a new password. */
    public void clearCredentials() {
        this.passwordHash = null;
        this.salt = null;
        this.iterations = null;
        this.requiresPasswordChange = true;
    }
}
