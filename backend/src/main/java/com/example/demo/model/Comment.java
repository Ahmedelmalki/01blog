package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})// what does this shit do
@Table(name = "comments")
public class Comment{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    @JsonIgnoreProperties({"comments", "author"})
    private Post post;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "email"})
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