package com.example.demo.controller;

import com.example.demo.service.AdminService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:4200")
@PreAuthorize("hasRole('ADMIN')")
@AllArgsConstructor
public class AdminController {
    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(){
        Map<String, Object> stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
    
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<?> deletePost(@RequestHeader("Authorization") String authHeader, @PathVariable Long postId){
        return adminService.deletePost(postId);
    }

    @PutMapping("/posts/{postId}")
    public ResponseEntity<?> hidePost(@RequestHeader("Authorization") String authHeader, @PathVariable Long postId){
        return adminService.hidePost(postId);
    }

    @PutMapping("/posts/{postId}/unhide")
    public ResponseEntity<?> unHidePost(@RequestHeader("Authorization") String authHeader, @PathVariable Long postId){
        return adminService.unHidePost(postId);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@RequestHeader("Authorization") String authHeader, @PathVariable Long userId){
        return adminService.deleteUser(userId);
    }

    @PutMapping("/users/{userId}/ban")
    public ResponseEntity<?> banUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long userId) {
        
        return adminService.banUser(userId);
    }

    @PutMapping("/users/{userId}/unban")
    public ResponseEntity<?> unbanUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long userId) {
        
        return adminService.unbanUser(userId);
    }
}
