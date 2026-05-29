package com.proyecto.login.security;

import com.proyecto.login.model.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/** Reads the Authorization header, validates the JWT, and populates the security context. */
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest req,
                                    @NonNull HttpServletResponse res,
                                    @NonNull FilterChain chain)
            throws ServletException, IOException {

        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                authenticate(jwtService.validate(token));
            } catch (JwtException | IllegalArgumentException ex) {
                // Invalid/expired token or unknown role claim: leave the request
                // unauthenticated so URL-based authorization rejects it with 401/403.
                // Logged at debug only — the reason is never leaked to the client.
                logger.debug("Rejected JWT: " + ex.getMessage());
            }
        }
        chain.doFilter(req, res);
    }

    /** Builds the authentication from validated claims. No-ops if claims are incomplete. */
    private void authenticate(Claims claims) {
        String username = claims.getSubject();
        String roleClaim = claims.get("role", String.class);
        if (username == null || roleClaim == null) {
            return;
        }

        // Validate the role against the enum (single source of truth);
        // an unknown value throws IllegalArgumentException and is rejected above.
        Role role = Role.valueOf(roleClaim);

        var auth = new UsernamePasswordAuthenticationToken(
                username, null,
                List.of(new SimpleGrantedAuthority(role.authority())));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}
