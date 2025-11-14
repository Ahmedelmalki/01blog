package com.example.demo.controller;

import com.example.demo.DTO.ReportRequest;
import com.example.demo.model.Report;
import com.example.demo.service.ReportService;
import com.example.demo.util.JwtUtil;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.*;

@RestController
@RequestMapping("/reports")
@CrossOrigin(origins = "http://localhost:4200")
@AllArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final JwtUtil jwtUtil;

    // Create a report - Available to ALL authenticated users
    @PostMapping
    public ResponseEntity<Map<String, String>> createReport(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ReportRequest request) {
            
        String token = authHeader.replace("Bearer ", "");
        String username = jwtUtil.extractUsername(token);

        Report report = reportService.createReport(username, request);
        return ResponseEntity.ok(Map.of(
            "message", "Report submitted successfully",
            "reportId", report.getId().toString()
        ));
    }

    // Get all reports - ADMIN ONLY
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Report>> getAllReports(
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader.replace("Bearer ", "");
        String username = jwtUtil.extractUsername(token);
        if (!isAdmin(username)) {
            return ResponseEntity.status(403).build();
        }
        
        List<Report> reports = reportService.getAllReports();
        return ResponseEntity.ok(reports);
    }

    // Get reports for a specific user - ADMIN ONLY
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Report>> getReportsForUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long userId) {
        
        String token = authHeader.replace("Bearer ", "");
        String username = jwtUtil.extractUsername(token);
        
        if (!isAdmin(username)) {
            return ResponseEntity.status(403).build();
        }
        
        List<Report> reports = reportService.getReportsForUser(userId);
        return ResponseEntity.ok(reports);
    }

    // Get reports for a specific post - ADMIN ONLY
    @GetMapping("/post/{postId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Report>> getReportsForPost(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long postId) {
        
        String token = authHeader.replace("Bearer ", "");
        String username = jwtUtil.extractUsername(token);
        
        if (!isAdmin(username)) {
            return ResponseEntity.status(403).build();
        }
        
        List<Report> reports = reportService.getReportsForPost(postId);
        return ResponseEntity.ok(reports);
    }

    // Helper method to check admin role
    private boolean isAdmin(String username) {
        return reportService.isUserAdmin(username);
    }
}