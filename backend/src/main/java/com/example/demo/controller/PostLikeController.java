package com.example.demo.controller;

import com.example.demo.model.PostLike;
import com.example.demo.service.PostLikeService;
import com.example.demo.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PathVariable;


@RestController
@RequestMapping("/posts/{postId}/like")
@CrossOrigin(origins = "http://localhost:4200")
public class PostLikeController{
    private final PostLikeService postLikeService;
    private final JwtUtil jwtUtil;
    public PostLikeController(PostLikeService postLikeService, JwtUtil jwtUtil ){
        this.postLikeService = postLikeService;
        this.jwtUtil =jwtUtil;
    }
    @PostMapping
    public ResponseEntity<?> toggleLike(@RequestHeader("Authorization") String authHeader, 
            @PathVariable Long postId,
            @RequestParam int value) {
        String token = authHeader.replace("Bearer ", "");
        String username = jwtUtil.extractUsername(token);
        System.out.println("============\n\n"+username+"liked your shit"+"============\n\n");

        PostLike result = postLikeService.toggleLike(username, postId, value);

        if (result == null){
            return ResponseEntity.ok("reaction removed");
        } else {
            return ResponseEntity.ok(result);
        }
        
    }
}
