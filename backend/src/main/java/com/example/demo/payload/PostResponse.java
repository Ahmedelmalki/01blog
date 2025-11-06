package com.example.demo.payload;

import com.example.demo.model.Post;

public class PostResponse {

    private Post post;
    private int likesCount;
    private int dislikesCount;
    private int commentsCount;
    private Integer userReaction;

    // return new PostResponse(post, likesCount, dislikesCount, commentsCount);
    public PostResponse(Post post, int likesCount,int  dislikesCount,int commentsCount){
        this.post = post;
        this.likesCount = likesCount;
        this.dislikesCount = dislikesCount;
        this.commentsCount = commentsCount;
    }

    public PostResponse(Post post, int likesCount, int dislikesCount, int commentsCount, Integer userReaction){
        this.post = post;
        this.likesCount = likesCount;
        this.dislikesCount = dislikesCount;
        this.commentsCount = commentsCount;
        this.userReaction = userReaction;
    }

    public Post getPost() { return post; }
    public int getLikesCount() { return likesCount; }
    public int getDislikesCount() { return dislikesCount; }
    public int getCommentsCount() { return commentsCount; }
    public Integer getUserReaction() {return userReaction;}
    public void setUserReaction(Integer userReaction) { this.userReaction = userReaction; }
}