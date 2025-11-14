package com.example.demo.controller;

import com.example.demo.DTO.CommentRequest;
import com.example.demo.model.Comment;
import com.example.demo.service.CommentService;
import com.example.demo.util.*;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@CrossOrigin(origins = "http://localhost:4200")
@AllArgsConstructor
public class CommentController {
    private final CommentService commentService;
    private final JwtUtil jwtUtil;

    @PostMapping("/comments")
    public ResponseEntity<Comment> createComment(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody CommentRequest request) {
        
        String token = authHeader.replace("Bearer ", "");
        String username = jwtUtil.extractUsername(token);

        Comment saved = commentService.createComment(username, request);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<Comment>> getCommentsByPost(@PathVariable Long postId) {
        List<Comment> comments = commentService.getCommentsByPostId(postId);
        return ResponseEntity.ok(comments);
    }
}