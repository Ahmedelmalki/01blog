package com.example.demo.controller;

import com.example.demo.DTO.*;
import com.example.demo.model.User;
import com.example.demo.service.AuthService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:4200")
@RestController 
@RequestMapping("/auth")
@AllArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody User user) {
        User savedUser = authService.register(user);
        return ResponseEntity.ok(new UserResponse(savedUser));
    }
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        String token = authService.login(request.getUsername(), request.getPassword());
        User user = authService.getUserByUsername(request.getUsername());
        return ResponseEntity.ok(new AuthResponse(token, new UserResponse(user)));
    }
}