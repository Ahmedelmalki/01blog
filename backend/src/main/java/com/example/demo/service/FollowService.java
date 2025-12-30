package com.example.demo.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.example.demo.repository.*;
import java.util.*;
import java.util.stream.Collectors;
import com.example.demo.model.*;
import lombok.*;

@Service
@AllArgsConstructor
public class FollowService {

    private final UserRepository userRepo;
    private final FollowRepository followRepo;
    private final NotificationService notificationService;
    
    // ========== GETING FOLLOWERS AND FOLLOWEES COUNT
    public int getFollowerCount(String username){
        User user = userRepo.findByUsername(username)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));
        
        return followRepo.countByFollowing(user);
    }

    public int getFollowingCount(String username){
        User user = userRepo.findByUsername(username)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));
        
        return followRepo.countByFollower(user);
    }

    public boolean toggleFollow(String followerUsername, String followingUsername){
        if (followerUsername.equals(followingUsername)){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "can not follow yourself");
        }

        User follower = userRepo.findByUsername(followerUsername)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));
        User following = userRepo.findByUsername(followingUsername)// todo: send notification to this mf
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));
    

        return followRepo.findByFollowerAndFollowing(follower, following)
                .map(exist -> {
                    followRepo.delete(exist);
                    return false;
                }).orElseGet(() -> {
                    Follow newFollow = new Follow(null, follower, following);
                    System.out.println("follower: "+follower.getUsername()+" following: "+following.getUsername()+"11111111111111\n\n\n\n\n");
                    followRepo.save(newFollow); // provided by jpa
                    notificationService.notifyFollow(follower, following);
                    return true;
                });
    }

    public boolean isFollowing(String followerUsername, String followingUsername){
        User follower = userRepo.findByUsername(followerUsername)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));
        User following = userRepo.findByUsername(followingUsername)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));
        return followRepo.existsByFollowerAndFollowing(follower, following);
    }

    public List<User> getFollowing(String username){
        User user = userRepo.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));
        return followRepo.findByFollower(user).stream() // later 
                .map(Follow::getFollowing)
                .collect(Collectors.toList());
    }

    public List<User> getFollowers(String username){
        User user = userRepo.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));
        return followRepo.findByFollowing(user).stream() // later 
                .map(Follow::getFollower)
                .collect(Collectors.toList());
    }
}