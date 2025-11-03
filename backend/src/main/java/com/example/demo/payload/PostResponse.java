package com.example.demo.payload;

import com.example.demo.model.Post;

public class PostResponse {

    private Post post;
    private int likesCount;
    private int dislikesCount;
    private int commentsCount;

    //         return new PostResponse(post, likesCount, dislikesCount, commentsCount);

    public PostResponse(Post post, int likesCount,int  dislikesCount,int commentsCount){
        this.post = post;
        this.likesCount = likesCount;
        this.dislikesCount = dislikesCount;
        this.commentsCount = commentsCount;
    }
    public Post getPost() { return post; }
    public int getLikesCount() { return likesCount; }
    public int getDislikesCount() { return dislikesCount; }
    public int getCommentsCount() { return commentsCount; }

}