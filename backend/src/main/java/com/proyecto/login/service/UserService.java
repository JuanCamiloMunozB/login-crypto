package com.proyecto.login.service;

import com.proyecto.login.crypto.HashedPassword;
import com.proyecto.login.crypto.PasswordManager;
import com.proyecto.login.crypto.PasswordPolicy;
import com.proyecto.login.crypto.SecureChars;
import com.proyecto.login.model.User;
import com.proyecto.login.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordManager passwordManager;
    private final PasswordPolicy passwordPolicy;

    /** Returns the previous successful login timestamp (may be null for a first login). */
    public LocalDateTime getLastLogin(String username) {
        LocalDateTime lastLogin = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"))
                .getLastLogin();

        if (lastLogin == null) {
            return null; 
        }

        ZoneId zoneDB = ZoneId.of("UTC");
        ZoneId zoneCO = ZoneId.of("America/Bogota");

        return lastLogin.atZone(zoneDB)
                .withZoneSameInstant(zoneCO)
                .toLocalDateTime();
    }

    /** Changes the password: generates a new salt and derives a new hash. */
    @Transactional
    public void changePassword(String username, String newPassword) {
        SecureChars.run(newPassword, password -> {
            passwordPolicy.validate(password);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            HashedPassword credential = passwordManager.hash(password);
            user.assignCredentials(credential.hash(), credential.salt(), credential.iterations());
            userRepository.save(user);
        });
    }
}
