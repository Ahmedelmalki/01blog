package com.example.demo.payload;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentRequest {
    private Long postId;
    private String content;
}