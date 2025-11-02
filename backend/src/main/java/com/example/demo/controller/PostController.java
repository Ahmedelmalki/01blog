package com.example.demo.controller;

import com.example.demo.model.Post;
import com.example.demo.service.PostService;
import org.springframework.http.ResponseEntity;
import com.example.demo.util.JwtUtil;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/posts")
@CrossOrigin(origins = "http://localhost:4200")
public class PostController {

    private final PostService postService;
    private final JwtUtil jwtUtil;

    public PostController(PostService postService, JwtUtil jwtUtil) {
        this.postService = postService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ResponseEntity<Post> createPost(@RequestHeader("Authorization") String authHeader, @RequestBody Post post) {
        // Extract token and username
        String token = authHeader.replace("Bearer ", "");
        String username = jwtUtil.extractUsername(token);

        System.out.println("==> "+ "entered"+username);
        Post savedPost = postService.createPost(username, post);
        return ResponseEntity.ok(savedPost);
    }
}
