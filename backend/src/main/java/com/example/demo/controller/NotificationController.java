package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import com.example.demo.service.NotificationService;
import com.example.demo.util.JwtUtil;
import java.util.*;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "http://localhost:4200")
@AllArgsConstructor
public class NotificationController {

    private final NotificationService ns;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications(
        @RequestHeader("Authorization") String authHeader,
        @RequestParam(defaultValue = "0")int page,
        @RequestParam(defaultValue = "20") int size) {
        String token = authHeader.replace("Bearer ", "").trim();
        String username = jwtUtil.extractUsername(token);

        Page<Map<String, Object>> notificationsPage = ns.getUserNotifications(username, page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("notifications", notificationsPage.getContent());
        response.put("currentPage", notificationsPage.getNumber());
        response.put("totalPages", notificationsPage.getTotalPages());
        response.put("totalItems", notificationsPage.getTotalElements());
        response.put("hasNext", notificationsPage.hasNext());

        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
        @RequestHeader("Authorization") String authHeader){
        
        String token = authHeader.replace("Bearer ", "").trim();
        String username = jwtUtil.extractUsername(token);

        long count = ns.getUnreadCount(username);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

      @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, String>> markAsRead(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {

        String token = authHeader.replace("Bearer ", "").trim();
        String username = jwtUtil.extractUsername(token);

        ns.markAsRead(id, username);
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    // Mark all as read
    @PutMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "").trim();
        String username = jwtUtil.extractUsername(token);

        ns.markAllAsRead(username);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    // Delete notification
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {

        String token = authHeader.replace("Bearer ", "").trim();
        String username = jwtUtil.extractUsername(token);

        ns.deleteNotification(id, username);
        return ResponseEntity.ok(Map.of("message", "Notification deleted"));
    }
}


