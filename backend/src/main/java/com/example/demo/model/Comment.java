package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "comments")
public class Comment{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User author;


    // You need an empty (no-args) constructor so that frameworks like 
    // JPA (Hibernate) can instantiate your entity class using reflection when loading data from the database
    public Comment(){}

    public Comment(String content, Post post, User author){
        this.content = content;
        this.post = post;
        this.author = author;
    }

    public Long getId() {return id;}
    public String getContent() {return content;}
    public void setContent(String content) {this.content = content;}
    
    public Post getPost() {return post;}
    public void setPost(Post post) {this.post = post;}

    public User getAuthor() {return author;}
    public void setAuthor(User author) {this.author = author;}
}