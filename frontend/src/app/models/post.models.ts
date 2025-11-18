export interface PostResponse {
    id: number;
    title: string;
    content: string;
    mediaLink: string;
    author: string;
    authorProfileLink?: string;
    createdAt: Date | null;
    likesCount: number;
    dislikesCount: number;
    commentsCount: number;
    userReaction?: number | null;
}


export interface UserInfo {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
}

export interface Comment {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
  };
  post: {
    id: number;
  };
}

export interface UserReport {
  id: number;
  reportedUser: {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
    state: number;
  };
  reporter: {
    username: string;
  };
  reason: string;
  createdAt: string;
}

export interface PostReport {
  id: number;
  reportedPost: {
    id: number;
    title: string;
    content: string;
    author: {
      username: string;
    };
  };
  reporter: {
    username: string;
  };
  reason: string;
  createdAt: string;
}