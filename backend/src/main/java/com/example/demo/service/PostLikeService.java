package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import lombok.*;

@Service
@AllArgsConstructor
public class PostLikeService {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostLike toggleLike(String username, Long postId, int value){
        if (value != 1 && value != -1){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Value must be 1 (like) or -1 (dislike)");
        }
        User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        return postLikeRepository.findByPostAndAuthor(post, user)
                .map(existing ->{
                    if(existing.getValue() == value){
                        postLikeRepository.delete(existing);
                        return null;
                    } else {
                        existing.setValue(value);
                        return postLikeRepository.save(existing);
                    }
                }).orElseGet(() -> postLikeRepository.save(new PostLike(value, post, user)));
    }
}