package com.example.demo.service;

import com.example.demo.DTO.*;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.List;
import org.springframework.data.domain.*;
import java.util.Optional;
import lombok.*;

@Service
@AllArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;

    public PostDTO createPost(String username, Post post) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getState() == -1) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are banned and cannot create posts");
        }

        post.setAuthor(user);
        Post savedPost = postRepository.save(post);
        return buildPostResponse(savedPost, username);    
    }

    public Page<PostDTO> getAllPosts(String username, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Post> postPage = postRepository.findAll(pageable);
        return postPage.map(post -> buildPostResponse(post, username));
    }

    public PostDTO getPostById(Long id, String username) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        return buildPostResponse(post, username);
    }

    public Page<PostDTO> getPostsByUsername(String username, String requestingUsername, int page, int size) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Post> postsPage = postRepository.findByAuthor(user, pageable);
        return postsPage.map(post -> buildPostResponse(post, requestingUsername));
    }

    
    public void deleltePost(Long postId, String username){
        Post post = postRepository.findById(postId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "post not found"));
        if (!post.getAuthor().getUsername().equals(username)){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "you can only delete your posts");
        }
        postRepository.delete(post);
    }   
    
    public PostDTO updatePost(Long postId, String username, Post updatedPost){
        Post post = postRepository.findById(postId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "post not found"));
        if (!post.getAuthor().getUsername().equals(username)){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "you can only delete your posts");
        }
        if (updatedPost.getTitle() != null){
            post.setTitle(updatedPost.getTitle());
        }
        if (updatedPost.getContent() != null){
            post.setContent(updatedPost.getContent());
        }
        if (updatedPost.getMediaLink() != null){
            post.setMediaLink(updatedPost.getMediaLink());
        }
        Post savedPost = postRepository.save(post);
        return buildPostResponse(savedPost, username);
    }

    // ==============   HELPER ===========
    private PostDTO buildPostResponse(Post post,String username) {
        int likesCount = postLikeRepository.countByPostAndValue(post, 1);
        int dislikesCount = postLikeRepository.countByPostAndValue(post, -1);
        int commentsCount = commentRepository.countByPost(post);
        
        Integer userReaction = null;
        if (username != null){
            Optional<User> userOpt = userRepository.findByUsername(username); // what optional does here
            if (userOpt.isPresent()){
                Optional<PostLike> userLike = postLikeRepository.findByPostAndAuthor(post, userOpt.get());
                userReaction = userLike.map(PostLike::getValue).orElse(null);
            }
        }

        return new PostDTO(
            post.getId(),
            post.getTitle(),
            post.getContent(),
            post.getMediaLink(),
            post.getAuthor().getUsername(),
            post.getAuthor().getProfileLink(),
            post.getCreatedAt(),
            likesCount,
            dislikesCount,
            commentsCount,
            userReaction);
    }
}