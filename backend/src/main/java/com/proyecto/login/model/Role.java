package com.proyecto.login.model;

/**
 * Application roles. Single source of truth for role identity: both the URL-based
 * rules in SecurityConfig and the JWT filter derive their authority names from here,
 * so there are no magic strings to drift out of sync.
 */
public enum Role {
    ADMIN,
    USER;

    /** Spring Security authority name, including the {@code ROLE_} prefix it expects. */
    public String authority() {
        return "ROLE_" + name();
    }
}
