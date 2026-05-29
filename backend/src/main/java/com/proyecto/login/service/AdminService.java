package com.proyecto.login.service;

import com.proyecto.login.model.Role;
import com.proyecto.login.model.User;
import com.proyecto.login.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;

    /** Returns the usernames of all registered accounts. */
    public List<String> listUsernames() {
        return userRepository.findAll().stream().map(User::getUsername).toList();
    }

    /** Deletes a user account. The admin account cannot be deleted. */
    @Transactional
    public void deleteUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getRole() == Role.ADMIN) {
            throw new IllegalStateException("Cannot delete the admin account");
        }
        userRepository.delete(user);
    }

    /** Clears the password hash and salt, forcing the user to set a new password. */
    @Transactional
    public void clearUserPassword(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getRole() == Role.ADMIN) {
            throw new IllegalStateException("Cannot clear the admin password");
        }
        user.setPasswordHash(null);
        user.setSalt(null);
        user.setRequiresPasswordChange(true);
        userRepository.save(user);
    }
}
