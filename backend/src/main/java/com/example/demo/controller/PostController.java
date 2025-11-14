package com.example.demo.controller;

import com.example.demo.DTO.PostDTO;
import com.example.demo.model.Post;
import com.example.demo.service.PostService;
import org.springframework.http.ResponseEntity;
import com.example.demo.util.JwtUtil;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/posts")
@CrossOrigin(origins = "http://localhost:4200")
@AllArgsConstructor
public class PostController {

    private final PostService postService;
    private final JwtUtil jwtUtil;

   @PostMapping
    public ResponseEntity<PostDTO> createPost( 
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Post post){

        String token = authHeader.replace("Bearer ", "").trim();
        String username = jwtUtil.extractUsername(token);
        PostDTO savedPost = postService.createPost(username, post);
        return ResponseEntity.ok(savedPost);
    }

    @GetMapping
    public ResponseEntity<List<PostDTO>> getAllPosts(
            @RequestHeader("Authorization") String authHeader){

        String token = authHeader.replace("Bearer", "").trim();
        String un = jwtUtil.extractUsername(token);
        List<PostDTO> posts = postService.getAllPosts(un);
        return ResponseEntity.ok(posts);
    }
 
    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> getPostById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader){

        String token = authHeader.replace("Bearer ", "").trim();
        String username = jwtUtil.extractUsername(token);
        PostDTO post = postService.getPostById(id, username);
        return ResponseEntity.ok(post);
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<PostDTO>> getPostsByUser(
            @PathVariable String username,
            @RequestHeader("Authorization") String authHeader){

        String token = authHeader.replace("Bearer ", "").trim();
        String requestingUsername = jwtUtil.extractUsername(token);
        List<PostDTO> posts = postService.getPostsByUsername(username, requestingUsername);
        return ResponseEntity.ok(posts);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostDTO> updatePost(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Post updatedPost){

        String token = authHeader.replace("Bearer ", "").trim();
        String requestingUsername = jwtUtil.extractUsername(token);
        PostDTO response = postService.updatePost(id, requestingUsername, updatedPost);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader){

        String token = authHeader.replace("Bearer ", "").trim();
        String requestingUsername = jwtUtil.extractUsername(token);
        postService.deleltePost(id, requestingUsername);
        return ResponseEntity.ok().body(Map.of("message", "Post deleted successfully"));
    }
}
