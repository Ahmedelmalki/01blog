import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBell, faCheck, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import { CompatClient, Stomp } from '@stomp/stompjs';
import {  NotificationsResponse } from '../models/notification.models';
import type { Notification } from '../models/notification.models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  currentPage = 0;
  pageSize = 20;
  hasMoreNotifications = true;
  isLoadingMore = false;
  unreadCount = 0;

  
  faBell = faBell;
  faCheck = faCheck;
  faTrash = faTrash;
  faTimes = faTimes;

  private stompClient: CompatClient | null = null;
  private subscription: any = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadNotifications();
    this.loadUnreadCount();
    this.connectWebSocket();
  }

  ngOnDestroy() {
    this.disconnectWebSocket();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      throw new Error('No token found');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  loadNotifications() {
    this.isLoading = true;
    this.errorMessage = null;

    const headers = this.getHeaders();
    const url = `http://localhost:8080/notifications?page=${this.currentPage}&size=${this.pageSize}`;

    this.http.get<NotificationsResponse>(url, { headers }).subscribe({
      next: (response) => {
        this.notifications = response.notifications;
        this.hasMoreNotifications = response.hasNext;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load notifications:', err);
        this.errorMessage = 'Failed to load notifications. Please try again.';
        this.isLoading = false;
        if (err.status === 401) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  loadMoreNotifications() {
    if (this.isLoadingMore || !this.hasMoreNotifications) return;

    this.isLoadingMore = true;
    this.currentPage++;

    const headers = this.getHeaders();
    const url = `http://localhost:8080/notifications?page=${this.currentPage}&size=${this.pageSize}`;

    this.http.get<NotificationsResponse>(url, { headers }).subscribe({
      next: (response) => {
        this.notifications = [...this.notifications, ...response.notifications];
        this.hasMoreNotifications = response.hasNext;
        this.isLoadingMore = false;
      },
      error: (err) => {
        console.error('Failed to load more notifications:', err);
        this.isLoadingMore = false;
        this.currentPage--;
      }
    });
  }

  loadUnreadCount() {
    const headers = this.getHeaders();
    this.http.get<{ unreadCount: number }>('http://localhost:8080/notifications/unread-count', { headers })
      .subscribe({
        next: (response) => {
          this.unreadCount = response.unreadCount;
        },
        error: (err) => {
          console.error('Failed to load unread count:', err);
        }
      });
  }

  markAsRead(notificationId: number) {
    const headers = this.getHeaders();
    this.http.put(`http://localhost:8080/notifications/${notificationId}/read`, {}, { headers })
      .subscribe({
        next: () => {
          const notification = this.notifications.find(n => n.id === notificationId);
          if (notification && !notification.isRead) {
            notification.isRead = true;
            this.unreadCount = Math.max(0, this.unreadCount - 1);
          }
        },
        error: (err) => {
          console.error('Failed to mark notification as read:', err);
        }
      });
  }

  markAllAsRead() {
    const headers = this.getHeaders();
    this.http.put('http://localhost:8080/notifications/read-all', {}, { headers })
      .subscribe({
        next: () => {
          this.notifications.forEach(n => n.isRead = true);
          this.unreadCount = 0;
        },
        error: (err) => {
          console.error('Failed to mark all as read:', err);
          this.errorMessage = 'Failed to mark all as read';
        }
      });
  }

  deleteNotification(notificationId: number) {
    const headers = this.getHeaders();
    this.http.delete(`http://localhost:8080/notifications/${notificationId}`, { headers })
      .subscribe({
        next: () => {
          const notification = this.notifications.find(n => n.id === notificationId);
          if (notification && !notification.isRead) {
            this.unreadCount = Math.max(0, this.unreadCount - 1);
          }
          this.notifications = this.notifications.filter(n => n.id !== notificationId);
        },
        error: (err) => {
          console.error('Failed to delete notification:', err);
          this.errorMessage = 'Failed to delete notification';
        }
      });
  }

  navigateToPost(notification: Notification) {
    if (notification.postId) {
      if (!notification.isRead) {
        this.markAsRead(notification.id);
      }
      this.router.navigate(['/feed'], { fragment: `post-${notification.postId}` });
    }
  }

  navigateToProfile(username: string) {
    this.router.navigate(['/profile', username]);
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'FOLLOW': return '👤';
      case 'NEW_POST': return '📝';
      case 'LIKE': return '❤️';
      case 'COMMENT': return '💬';
      default: return '🔔';
    }
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  }

  private connectWebSocket() {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.stompClient = Stomp.client('ws://localhost:8080/ws'); 
    console.log("000000000000000000000000000000000");
    
    this.stompClient.debug = (str) => {
      console.log('STOMP: ' + str);
    };

    this.stompClient.connect(
      {},
      () => {
        console.log('WebSocket connected');
        if (this.stompClient) {
          this.subscription = this.stompClient.subscribe(
            '/user/queue/notifications',
            (message: any) => {
              const notification = JSON.parse(message.body);
              this.handleNewNotification(notification);
            }
          );
        }
      },
      (error: any) => {
        console.error('WebSocket connection error:', error);
      }
    );
    console.log("1111111111111111111111");
    
  }

  private disconnectWebSocket() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.stompClient) {
      this.stompClient.disconnect();
    }
  }

  private handleNewNotification(notification: Notification) {
    this.notifications.unshift(notification);
    this.unreadCount++;
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Notification', {
        body: notification.message,
        icon: '/assets/notification-icon.png'
      });
    }
  }

  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  onScroll(event: any) {
    const element = event.target;
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 100) {
      this.loadMoreNotifications();
    }
  }

  hasUnreadNotifications(): boolean {
    return this.notifications.some(n => !n.isRead);
  }
}