package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import lombok.*;
import java.util.*;

@Service
@AllArgsConstructor
public class AdminService {
    private final PostRepository postRepo;
    private final UserRepository userRepo;
    private final ReportRepository reportRepo;
    
    public ResponseEntity<?> deletePost(Long postId){
        Post post = postRepo.findById(postId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "post not found"));
        
        List<Report> relatedReports = reportRepo.findByReportedPost(post);
        reportRepo.deleteAll(relatedReports);
        postRepo.delete(post);
        
        return ResponseEntity.ok(Map.of(
            "message", "Post and related reports deleted successfully",
            "reportsDeleted", relatedReports.size()
        ));
    }    
    
    public ResponseEntity<?> hidePost(Long postId){
        Post post = postRepo.findById(postId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "post not found"));
        if(post.isHidden()){
            return ResponseEntity.ok(Map.of(
                "message", "Post is already hidden"
            ));
        }
        post.setHidden(true);
        postRepo.save(post);

        return ResponseEntity.ok(Map.of(
            "message", "Post has been hidden successfully"
        ));
    }

    public ResponseEntity<?> unHidePost(Long postId){
        Post post = postRepo.findById(postId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "post not found"));
        if(!post.isHidden()){
            return ResponseEntity.ok(Map.of(
                "message", "Post is already visible"
            ));    
        }
        post.setHidden(false);
        postRepo.save(post);
        List<Report> relatedReports = reportRepo.findByReportedPost(post);
        reportRepo.deleteAll(relatedReports);
        return ResponseEntity.ok(Map.of(
            "message", "Post has been hidden successfully"
        ));
    }

    // delete user 
    public ResponseEntity<?> deleteUser(Long userId){
        User user = userRepo.findById(userId)
            .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));
        
        List<Report> reportsAboutUser = reportRepo.findByReportedUser(user);
        reportRepo.deleteAll(reportsAboutUser);
        
        List<Report> reportsByUser = reportRepo.findByReporter(user);
        reportRepo.deleteAll(reportsByUser);
        userRepo.delete(user);
        
        return ResponseEntity.ok(Map.of(
            "message", "User and related reports deleted successfully",
            "reportsDeleted", reportsAboutUser.size() + reportsByUser.size()
        ));
    }

    // ban user 
    public ResponseEntity<?> banUser(Long userId){
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));
        
        if (user.getState() == -1){
            return ResponseEntity.ok("user already banned");
        }

        user.setState(-1);
        userRepo.save(user);
        return ResponseEntity.ok(Map.of(
            "message", "User banned successfully",
            "username", user.getUsername()
        ));
    }

    public ResponseEntity<?> unbanUser(Long userId){
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));
        if (user.getState() == 1){
            return ResponseEntity.ok("user is not banned");
        }
        user.setState(1);
        userRepo.save(user);
        
        return ResponseEntity.ok(Map.of(
            "message", "User unbanned successfully",
            "username", user.getUsername()
        ));
    }

    public Map<String, Object> getDashboardStats(){
        long totalUsers = userRepo.count();
        long totalPosts = postRepo.count();
        long totalReports = reportRepo.count();
        long bannedUsers = userRepo.countByState(-1);
        
        return Map.of(
            "totalUsers", totalUsers,
            "totalPosts", totalPosts,
            "totalReports", totalReports,
            "bannedUsers", bannedUsers
        );
    }
}
