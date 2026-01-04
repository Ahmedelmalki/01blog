package com.example.demo.DTO;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentRequest {
    private Long id;
    private Long postId;
    private String content;
}