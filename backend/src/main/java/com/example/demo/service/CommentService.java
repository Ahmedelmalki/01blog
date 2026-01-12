
package com.example.demo.service;

import com.example.demo.DTO.CommentRequest;
import com.example.demo.model.*;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.PostRepository; 
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.*;
import lombok.*;

@AllArgsConstructor
@Service 
public class CommentService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;

    public Comment createComment(String username, CommentRequest request){
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getState() == -1) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are banned and cannot create comments");
        }

        if (request.getContent().length() > 500){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment is too long");
        }

        Post post = postRepository.findById(request.getPostId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        Comment comment = new Comment(request.getContent(), post, user);

        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsByPostId(Long postId){
        Post post = postRepository.findById(postId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        return commentRepository.findByPostOrderByIdDesc(post);
    }

    public ResponseEntity<?> deleteComment(Long id, String username){
        Comment comment = commentRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
        
        if (!comment.getAuthor().getUsername().equals(username)){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "you can't delete this comment");           
        }
        commentRepository.delete(comment);
        
        return ResponseEntity.ok(Map.of(
            "message", "Comment and related reports deleted successfully"
        ));
    }
}