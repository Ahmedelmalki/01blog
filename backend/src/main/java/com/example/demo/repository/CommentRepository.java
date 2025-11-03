package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.model.Comment;
import com.example.demo.model.Post;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    int countByPost(Post post);
}