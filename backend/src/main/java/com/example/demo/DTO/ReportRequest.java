package com.example.demo.DTO;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequest {
    private String reason;
    private String reportedUsername;  
    private Long reportedPostId;  
}