package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.service.FollowService;
import com.example.demo.util.JwtUtil;
import lombok.AllArgsConstructor;
import java.util.*;
import java.util.stream.Collectors;
import com.example.demo.payload.*;
import com.example.demo.model.*;

@RestController
@RequestMapping("/follow")
@CrossOrigin(origins = "http://localhost:4200")
@AllArgsConstructor
public class FollowController {

    private final FollowService followService;
    private final JwtUtil jwtUtil;

    @PostMapping("/{username}")
      public ResponseEntity<Map<String, Object>> toggleFollow(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String username) {
        
        String token = authHeader.replace("Bearer ", "").trim();
        String followerUsername = jwtUtil.extractUsername(token);

        boolean isNowFollowing = followService.toggleFollow(followerUsername, username);
        
        Map<String, Object> response = new HashMap<>();
        response.put("following", isNowFollowing);
        response.put("message", isNowFollowing ? "Followed successfully" : "Unfollowed successfully");
        
        return ResponseEntity.ok(response);

    }

    @GetMapping("/status/{username}")
    public ResponseEntity<Map<String, Boolean>> checkFollowStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String username){

        String token = authHeader.replace("Bearer ", "").trim();
        String currentUsername = jwtUtil.extractUsername(token);

        boolean isFollowing = followService.isFollowing(currentUsername, username);
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("following", isFollowing);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{username}/following")
    public ResponseEntity<List<UserResponse>> getFollowing(@PathVariable String username){
        List<User> following = followService.getFollowing(username);
        List<UserResponse> response = following.stream()
            .map(UserResponse::new).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{username}/followers")
    public ResponseEntity<List<UserResponse>> getFollowers(@PathVariable String username){
        List<User> following = followService.getFollowers(username);
        List<UserResponse> response = following.stream()
            .map(UserResponse::new).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{username}/stats")
    public ResponseEntity<Map<String, Integer>> getFollowStats(@PathVariable String username){ 
        Map<String, Integer> stats = new HashMap<>();
        stats.put("followers", followService.getFollowerCount(username));
        stats.put("following", followService.getFollowingCount(username));
        return ResponseEntity.ok(stats);
    }
}