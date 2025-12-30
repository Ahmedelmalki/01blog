package com.example.demo.repository;

import com.example.demo.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {
  Page<Post> findByAuthor(User author, Pageable pageable);

  Page<Post> findByHiddenFalse(Pageable pageable);

  @Query("SELECT p FROM Post p WHERE p.author IN " +
       "(SELECT f.following FROM Follow f WHERE f.follower = :user) " +
       "ORDER BY p.createdAt DESC")
  Page<Post> findPostsByFollowedUsers(@Param("user") User user, Pageable pageable);
}
