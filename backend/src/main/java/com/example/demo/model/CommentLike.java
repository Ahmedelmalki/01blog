package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "comment_likes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"comment_id", "user_id"})
})
public class CommentLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id", nullable = false)
    private Comment comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User author;

    @Column(nullable = false)
    private int value; // 1 = like, -1 = dislike

    public CommentLike() {}

    public CommentLike(int value, Comment comment, User author) {
        this.value = value;
        this.comment = comment;
        this.author = author;
    }

    // Getters and Setters
    public Long getId() { return id; }
    
    public Comment getComment() { return comment; }
    public void setComment(Comment comment) { this.comment = comment; }

    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }

    public int getValue() { return value; }
    public void setValue(int value) { this.value = value; }
}