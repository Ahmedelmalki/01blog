package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.PostRepository; // responsible for saving shit
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service 
public class CommentService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;

    public CommentService(PostRepository postRepository, UserRepository userRepository, CommentRepository commentRepository){
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
    }

    public Comment createComment(String username, Long postId, String content){
            // Find the user
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Find the post
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        // Create and save comment
        Comment comment = new Comment(content, post, user);

        return commentRepository.save(comment);
    }
}