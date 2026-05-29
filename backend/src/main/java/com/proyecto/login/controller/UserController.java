package com.proyecto.login.controller;

import com.proyecto.login.dto.ChangePasswordRequest;
import com.proyecto.login.dto.LastLoginResponse;
import com.proyecto.login.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me/last-login")
    public LastLoginResponse lastLogin(Authentication auth) {
        return new LastLoginResponse(userService.getLastLogin(auth.getName()));
    }

    @PutMapping("/me/password")
    public void changePassword(Authentication auth,
                               @RequestBody @Valid ChangePasswordRequest request) {
        userService.changePassword(auth.getName(), request.newPassword().toCharArray());
    }
}
