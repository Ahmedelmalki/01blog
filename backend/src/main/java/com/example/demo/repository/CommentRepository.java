package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.model.Comment;
import com.example.demo.model.Post;
import java.util.*;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    int countByPost(Post post);
    List<Comment> findByPostOrderByIdDesc(Post post);
    // Comment findById(Long id);
}