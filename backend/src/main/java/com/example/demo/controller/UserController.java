package com.example.demo.controller;

import com.example.demo.DTO.UserResponse;
import com.example.demo.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@AllArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        UserResponse user = userService.getCurrentUser();
        return ResponseEntity.ok(user);
    }

    @GetMapping
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserResponse> getUserByUsername(@PathVariable String username) {
        UserResponse user = userService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }
}