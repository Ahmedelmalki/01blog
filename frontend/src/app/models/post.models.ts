export interface PostResponse {
    post: {
        id: number;
        title: string;
        content: string;
        mediaLink: string;
        author: {
            id: number;
            username: string;
            firstname: string;
            lastname: string;
        };
    };
    likesCount: number;
    dislikesCount: number;
    commentsCount: number;
    userReaction?: number;
}

export interface UserInfo {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
}