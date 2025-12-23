import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { CompatClient, Stomp } from '@stomp/stompjs';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  template: `
    <button class="notification-bell" routerLink="/notifications" [title]="'You have ' + unreadCount + ' unread notifications'">
      <fa-icon [icon]="faBell" [class.has-unread]="unreadCount > 0"></fa-icon>
      <span *ngIf="unreadCount > 0" class="notification-badge">
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>
  `,
  styles: [`
    .notification-bell {
      position: relative;
      padding: 0.6rem 1rem;
      background-color: #f8f9fa;
      border: 1px solid #ddd;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notification-bell:hover {
      background-color: #e9ecef;
      border-color: #adb5bd;
    }

    .notification-bell fa-icon {
      font-size: 1.1rem;
      color: #666;
      transition: color 0.2s;
    }

    .notification-bell fa-icon.has-unread {
      color: #007bff;
      animation: ring 1s ease-in-out infinite;
    }

    @keyframes ring {
      0%, 100% { transform: rotate(0deg); }
      10%, 30% { transform: rotate(-10deg); }
      20%, 40% { transform: rotate(10deg); }
    }

    .notification-badge {
      position: absolute;
      top: -6px;
      right: -6px;
      background-color: #dc3545;
      color: #fff;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.15rem 0.4rem;
      border-radius: 10px;
      min-width: 20px;
      text-align: center;
      line-height: 1;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    /* Dark Mode */
    :host-context(.dark-mode) .notification-bell {
      background-color: #2c2c2c;
      border-color: #444;
    }

    :host-context(.dark-mode) .notification-bell:hover {
      background-color: #3c3c3c;
      border-color: #555;
    }

    :host-context(.dark-mode) .notification-bell fa-icon {
      color: #aaa;
    }

    :host-context(.dark-mode) .notification-bell fa-icon.has-unread {
      color: #4a9eff;
    }
  `]
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  unreadCount = 0;
  faBell = faBell;
  
  private stompClient: CompatClient | null = null;
  private subscription: any = null;
  private countCheckInterval: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUnreadCount();
    this.connectWebSocket();
    
    // Poll for unread count every 30 seconds as backup
    this.countCheckInterval = setInterval(() => {
      this.loadUnreadCount();
    }, 30000);
  }

  ngOnDestroy() {
    this.disconnectWebSocket();
    if (this.countCheckInterval) {
      clearInterval(this.countCheckInterval);
    }
  }

  private loadUnreadCount() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

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

  private connectWebSocket() {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Use native WebSocket endpoint
    this.stompClient = Stomp.client('ws://localhost:8080/ws');
    
    // Disable debug logging
    this.stompClient.debug = () => {};

    this.stompClient.connect(
      {},
      () => {
        if (this.stompClient) {
          this.subscription = this.stompClient.subscribe(
            '/user/queue/notifications',
            (message: any) => {
              this.unreadCount++;
              
              // Show browser notification
              if ('Notification' in window && Notification.permission === 'granted') {
                const notification = JSON.parse(message.body);
                new Notification('New Notification', {
                  body: notification.message,
                  icon: '/assets/notification-icon.png'
                });
              }
            }
          );
        }
      },
      (error: any) => {
        console.error('WebSocket connection error:', error);
      }
    );
  }

  private disconnectWebSocket() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.stompClient) {
      this.stompClient.disconnect();
    }
  }
}