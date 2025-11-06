package com.example.demo.controller;

import com.example.demo.model.Post;
import com.example.demo.service.PostService;
import org.springframework.http.ResponseEntity;
import com.example.demo.util.JwtUtil;
import org.springframework.web.bind.annotation.*;
import com.example.demo.payload.PostResponse;
import java.util.List;

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
    public ResponseEntity<PostResponse> createPost(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Post post) {

        String token = authHeader.replace("Bearer ", "").trim();
        String username = jwtUtil.extractUsername(token);
        PostResponse savedPost = postService.createPost(username, post);
        return ResponseEntity.ok(savedPost);
    }

    // Get all posts (feed)
    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer", "").trim();
        String un = jwtUtil.extractUsername(token);
        List<PostResponse> posts = postService.getAllPosts(un);
        return ResponseEntity.ok(posts);
    }

    // wtf is that 
    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "").trim();
        String username = jwtUtil.extractUsername(token);
        PostResponse post = postService.getPostById(id, username);
        return ResponseEntity.ok(post);
    }

    // Get posts by specific user
    @GetMapping("/user/{username}")
    public ResponseEntity<List<PostResponse>> getPostsByUser(@PathVariable String username, @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "").trim();
        String requestingUsername = jwtUtil.extractUsername(token);
        List<PostResponse> posts = postService.getPostsByUsername(username, requestingUsername);
        return ResponseEntity.ok(posts);
    }
}
