export interface UserReport {
  id: number;
  reportedUser: {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
    profileLink: string,
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