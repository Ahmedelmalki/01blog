package com.example.demo.DTO;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequest {
    private String reason;
    private Long reportedUserId;  
    private Long reportedPostId;  
}