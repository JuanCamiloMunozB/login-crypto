package com.proyecto.login.service;

import com.proyecto.login.crypto.HashedPassword;
import com.proyecto.login.crypto.PasswordManager;
import com.proyecto.login.crypto.PasswordPolicy;
import com.proyecto.login.crypto.SecureChars;
import com.proyecto.login.dto.LoginRequest;
import com.proyecto.login.dto.LoginResponse;
import com.proyecto.login.dto.RegisterRequest;
import com.proyecto.login.exception.ConflictException;
import com.proyecto.login.model.Role;
import com.proyecto.login.model.User;
import com.proyecto.login.repository.UserRepository;
import com.proyecto.login.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordManager passwordManager;
    private final PasswordPolicy passwordPolicy;
    private final JwtService jwtService;

    /**
     * Public self-registration. Always creates a regular {@link Role#USER} account so a
     * caller can never escalate to ADMIN through this endpoint.
     */
    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Username already taken");
        }

        SecureChars.run(request.password(), password -> {
            passwordPolicy.validate(password);
            HashedPassword credential = passwordManager.hash(password);

            User user = User.builder()
                    .username(request.username())
                    .role(Role.USER) // self-registration is never privileged
                    .build();
            user.assignCredentials(credential.hash(), credential.salt(), credential.iterations());
            userRepository.save(user);
        });
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        // Account with a cleared password cannot log in.
        if (user.getPasswordHash() == null) {
            throw new BadCredentialsException("Invalid credentials");
        }

        boolean valid = SecureChars.use(request.password(), pwd ->
                passwordManager.verify(
                        pwd, user.getSalt(), user.getIterations(), user.getPasswordHash()));

        if (!valid) {
            throw new BadCredentialsException("Invalid credentials");
        }

        // Rotate login timestamps.
        user.setLastLogin(user.getCurrentLogin());
        user.setCurrentLogin(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtService.generate(user.getUsername(), user.getRole().name());
        return new LoginResponse(token, user.getUsername(), user.getRole().name());
    }
}
