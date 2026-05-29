package com.proyecto.login.service;

import com.proyecto.login.crypto.PasswordManager;
import com.proyecto.login.model.User;
import com.proyecto.login.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordManager passwordManager;

    public LocalDateTime getLastLogin(String username) {
        return userRepository.findByUsername(username)
                .map(User::getLastLogin)
                .orElse(null);
    }

    /** Changes the password: generates a new salt and derives a new hash. */
    @Transactional
    public void changePassword(String username, char[] newPassword) {
        validatePasswordPolicy(newPassword);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String salt = passwordManager.generateSaltBase64();
        String hash = passwordManager.hashPassword(newPassword, salt, PasswordManager.ITERATIONS);

        user.setSalt(salt);
        user.setPasswordHash(hash);
        user.setIterations(PasswordManager.ITERATIONS);
        user.setRequiresPasswordChange(false);
        userRepository.save(user);

        Arrays.fill(newPassword, '\0');
    }

    private void validatePasswordPolicy(char[] password) {
        String s = new String(password);
        if (s.length() < 8)
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        if (!s.matches(".*[A-Z].*") || !s.matches(".*[a-z].*") || !s.matches(".*\\d.*"))
            throw new IllegalArgumentException("Password must contain an uppercase letter, a lowercase letter, and a digit");
    }
}
