package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.payload.ReportRequest;
import com.example.demo.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import lombok.AllArgsConstructor;
import java.util.List;

@Service
@AllArgsConstructor
public class ReportService {
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    // get all reports
    public List<Report> getAllReports(){
        return reportRepository.findAll();
    } 

    // get all reports for a user
    public List<Report> getReportsForUser(Long reportedId){
        User reported = userRepository.findById(reportedId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));
        return reportRepository.findByReportedUser(reported);
    }
    
    // get all reports for a post
    public List<Report> getReportsForPost(Long reportedId){
        Post reported = postRepository.findById(reportedId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "post not found"));
        return reportRepository.findByReportedPost(reported);
    }

    public boolean isUserAdmin(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return user.getRoles().contains("ADMIN");
    }

    // create report
    public Report createReport(String reporterUsername, ReportRequest request){
        if (request.getReportedUserId() == null && request.getReportedPostId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Must specify either reportedUserId or reportedPostId");
        }
        if (request.getReportedUserId() != null && request.getReportedPostId() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Cannot report both a user and a post in the same report");
        }

        User reporter = userRepository.findByUsername(reporterUsername)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));
        Report report = new Report();
        report.setReason(request.getReason());
        report.setReporter(reporter);

        // reporting a user
        if (request.getReportedUserId() != null){
            User reportedUser = userRepository.findById(request.getReportedUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reported user not found"));
            
            // Prevent self-reporting
            if (reporter.getId().equals(reportedUser.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot report yourself");
            }
            
            // Check if already reported
            if (reportRepository.existsByReporterAndReportedUser(reporter, reportedUser)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "You have already reported this user");
            }
            
            report.setReportedUser(reportedUser);
        }

        // reporting a post
        if (request.getReportedPostId() != null){
                Post reportedPost = postRepository.findById(request.getReportedPostId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reported post not found"));
            
            // Check if already reported
            if (reportRepository.existsByReporterAndReportedPost(reporter, reportedPost)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "You have already reported this user");
            }
            
            report.setReportedPost(reportedPost);
        }

        return reportRepository.save(report);
    }
    
}

