package com.proyecto.login.service;

import com.proyecto.login.crypto.PasswordManager;
import com.proyecto.login.dto.LoginRequest;
import com.proyecto.login.dto.LoginResponse;
import com.proyecto.login.model.User;
import com.proyecto.login.repository.UserRepository;
import com.proyecto.login.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordManager passwordManager;
    private final JwtService jwtService;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        // Account with a cleared password cannot log in.
        if (user.getPasswordHash() == null) {
            throw new BadCredentialsException("Invalid credentials");
        }

        char[] pwd = request.password().toCharArray();
        boolean valid = passwordManager.verify(
                pwd, user.getSalt(), user.getIterations(), user.getPasswordHash());
        Arrays.fill(pwd, '\0'); // zero the password array from memory

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
