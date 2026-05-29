package com.proyecto.login.dto;

import jakarta.validation.constraints.NotBlank;

/** Payload for public self-registration. Always results in a regular USER account. */
public record RegisterRequest(@NotBlank String username, @NotBlank String password) {}
