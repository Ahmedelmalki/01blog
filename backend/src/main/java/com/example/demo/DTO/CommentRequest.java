package com.example.demo.DTO;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentRequest {
    private Long postId;
    private String content;
}