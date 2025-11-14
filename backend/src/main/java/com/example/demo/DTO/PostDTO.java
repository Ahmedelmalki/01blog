package com.example.demo.DTO;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PostDTO {
    private Long id;
    private String title;
    private String content;
    private String mediaLink;
    private String author;
    private LocalDateTime createdAt;
    private int likesCount;
    private int dislikesCount;
    private int commentsCount;
    private Integer userReaction;
}