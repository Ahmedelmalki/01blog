package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.payload.UserResponse;
import com.example.demo.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody User user) {
        System.out.println(user.toString()); // remove later
        User savedUser = authService.register(user);
        return ResponseEntity.ok(new UserResponse(savedUser));
    }
}