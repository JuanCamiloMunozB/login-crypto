package com.proyecto.login.config;

import com.proyecto.login.crypto.HashedPassword;
import com.proyecto.login.crypto.PasswordManager;
import com.proyecto.login.model.Role;
import com.proyecto.login.model.User;
import com.proyecto.login.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/** Creates the initial admin account on first startup if none exists. */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordManager passwordManager;

    @Value("${app.admin.username}") private String adminUsername;
    @Value("${app.admin.password}") private String adminPassword;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByRole(Role.ADMIN)) {
            HashedPassword credential = passwordManager.hash(adminPassword.toCharArray());

            User admin = User.builder()
                    .username(adminUsername)
                    .role(Role.ADMIN)
                    .build();
            admin.assignCredentials(credential.hash(), credential.salt(), credential.iterations());

            userRepository.save(admin);
            System.out.println(">> Initial admin account created: " + adminUsername);
        }
    }
}
