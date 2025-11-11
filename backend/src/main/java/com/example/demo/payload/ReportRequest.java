package com.example.demo.payload;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequest {
    private String reason;
    private Long reportedUserId;  
    private Long reportedPostId;  
}