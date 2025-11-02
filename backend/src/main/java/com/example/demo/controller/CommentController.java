package com.example.demo.controller;

import com.example.demo.model.Comment;
import com.example.demo.payload.CommentRequest;
import com.example.demo.service.CommentService;
import com.example.demo.util.*;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/comments")
@CrossOrigin(origins = "http://localhost:4200")
public class CommentController {
    private final CommentService commentService;
    private final JwtUtil jwtUtil;

    public CommentController(CommentService commentService, JwtUtil jwtUtil){
        this.commentService = commentService;
        this.jwtUtil = jwtUtil;
    }
    @PostMapping
    public ResponseEntity<Comment> createComment(@RequestHeader("Authorization") String authHeader, @RequestBody CommentRequest request) {
    String token = authHeader.replace("Bearer ", "");
    String username = jwtUtil.extractUsername(token);

    Comment saved = commentService.createComment(
        username,
       request
    );

    return ResponseEntity.ok(saved);
    }
}