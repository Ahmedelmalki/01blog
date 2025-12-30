export interface Notification {
  id: number;
  type: string;
  message: string;
  actorUsername: string;
  actorProfileLink?: string;
  postId?: number;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
}