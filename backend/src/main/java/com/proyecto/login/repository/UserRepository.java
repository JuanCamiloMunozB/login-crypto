package com.proyecto.login.repository;

import com.proyecto.login.model.Role;
import com.proyecto.login.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByRole(Role role);
    List<User> findByRole(Role role);
}
