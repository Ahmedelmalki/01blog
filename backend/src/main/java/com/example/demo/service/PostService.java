package com.example.demo.service;

import com.example.demo.model.Post;
import com.example.demo.model.User;
import com.example.demo.payload.PostResponse;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.PostLikeRepository;
import com.example.demo.repository.CommentRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;

    public PostService(PostRepository postRepository, 
                      UserRepository userRepository,
                      PostLikeRepository postLikeRepository,
                      CommentRepository commentRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.postLikeRepository = postLikeRepository;
        this.commentRepository = commentRepository;
    }

    // Create a new post
    public PostResponse createPost(String username, Post post) {
    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    post.setAuthor(user);
    Post savedPost = postRepository.save(post);
    return buildPostResponse(savedPost);
}

    // Get all posts (for feed)
    public List<PostResponse> getAllPosts() {
        return postRepository.findAll().stream()
            .map(this::buildPostResponse)
            .collect(Collectors.toList());
    }

    // Get a single post by ID
    public PostResponse getPostById(Long id) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        return buildPostResponse(post);
    }

    // Get all posts by a specific user
    public List<PostResponse> getPostsByUsername(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        return postRepository.findByAuthor(user).stream()
            .map(this::buildPostResponse)
            .collect(Collectors.toList());
    }

    // Helper method to build PostResponse with aggregated data
    private PostResponse buildPostResponse(Post post) {
        int likesCount = postLikeRepository.countByPostAndValue(post, 1);
        int dislikesCount = postLikeRepository.countByPostAndValue(post, -1);
        int commentsCount = commentRepository.countByPost(post);
        
        return new PostResponse(post, likesCount, dislikesCount, commentsCount);
    }
}