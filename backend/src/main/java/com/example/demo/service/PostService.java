package com.example.demo.service;

import com.example.demo.model.Post;
import com.example.demo.model.PostLike;
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
import java.util.Optional;
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

    public PostResponse createPost(String username, Post post) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        post.setAuthor(user);
        Post savedPost = postRepository.save(post);
        return buildPostResponse(savedPost, username);    
    }

    public List<PostResponse> getAllPosts(String username) {
        return postRepository.findAll().stream()
            .map(post -> buildPostResponse(post, username))
            .collect(Collectors.toList());
    }

    public PostResponse getPostById(Long id, String username) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        return buildPostResponse(post, username);
    }

    // Get all posts by a specific user
    public List<PostResponse> getPostsByUsername(String username, String requestingUsername) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        return postRepository.findByAuthor(user).stream()
            .map(post -> buildPostResponse(post, requestingUsername))
            .collect(Collectors.toList());
    }

    // Helper method to build PostResponse with aggregated data
    private PostResponse buildPostResponse(Post post,String username) {
        int likesCount = postLikeRepository.countByPostAndValue(post, 1);
        int dislikesCount = postLikeRepository.countByPostAndValue(post, -1);
        int commentsCount = commentRepository.countByPost(post);
        
        Integer userReaction = null;
        if (username != null){
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isPresent()){
                Optional<PostLike> userLike = postLikeRepository.findByPostAndAuthor(post, userOpt.get());
                userReaction = userLike.map(PostLike::getValue).orElse(null);
            }
        }

        return new PostResponse(post, likesCount, dislikesCount, commentsCount, userReaction);
    }
}