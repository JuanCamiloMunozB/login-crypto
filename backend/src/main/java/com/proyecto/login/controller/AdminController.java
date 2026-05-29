package com.proyecto.login.controller;

import com.proyecto.login.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public List<String> listUsers() {
        return adminService.listUsernames();
    }

    @DeleteMapping("/users/{username}")
    public void deleteUser(@PathVariable String username) {
        adminService.deleteUser(username);
    }

    @PutMapping("/users/{username}/clear-password")
    public void clearPassword(@PathVariable String username) {
        adminService.clearUserPassword(username);
    }
}
