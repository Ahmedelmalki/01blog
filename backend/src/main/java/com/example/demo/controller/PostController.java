package com.example.demo.controller;

import com.example.demo.DTO.PostDTO;
import com.example.demo.model.Post;
import com.example.demo.service.PostService;
import org.springframework.http.ResponseEntity;
import com.example.demo.util.JwtUtil;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.*;

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
    public ResponseEntity<Map<String, Object>> getAllPosts(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size){

        String token = authHeader.replace("Bearer", "").trim();
        String un = jwtUtil.extractUsername(token);
        Page<PostDTO> postsPage = postService.getAllPosts(un, page, size);
        
        Map<String, Object> response = new HashMap<>();
        response.put("posts", postsPage.getContent());
        response.put("currentPage", postsPage.getNumber());
        response.put("totalPages", postsPage.getTotalPages());
        response.put("totalItems", postsPage.getTotalElements());
        response.put("hasNext", postsPage.hasNext());
        
        return ResponseEntity.ok(response);
    }

    // @GetMapping("/following{username}")
    // public ResponseEntity<Map<String, Object>> getFolloingPosts(){}
 
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
    public ResponseEntity<Map<String, Object>> getPostsByUser(
            @PathVariable String username,
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size){

        String token = authHeader.replace("Bearer ", "").trim();
        String requestingUsername = jwtUtil.extractUsername(token);
        Page<PostDTO> postsPage = postService.getPostsByUsername(username, requestingUsername, page, size);
        
        Map<String, Object> response = new HashMap<>();
        response.put("posts", postsPage.getContent());
        response.put("currentPage", postsPage.getNumber());
        response.put("totalPages", postsPage.getTotalPages());
        response.put("totalItems", postsPage.getTotalElements());
        response.put("hasNext", postsPage.hasNext());
        
        return ResponseEntity.ok(response);
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
