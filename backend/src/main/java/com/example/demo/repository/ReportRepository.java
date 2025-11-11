package com.example.demo.repository;

import com.example.demo.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


public interface ReportRepository extends JpaRepository<Report, Long>{
    List<Report> findByReporter(User reporter);

    List<Report> findByReportedUser(User reportedUser);

    List<Report> findByReportedPost(Post reportedPost);
    
    // Check if user already reported this user
    boolean existsByReporterAndReportedUser(User Reporter, User ReportedUser);

    // Check if user already reported this post
    boolean existsByReporterAndReportedPost(User Reporter, Post ReportedPost);
}