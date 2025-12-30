// not-found.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  template: /*html*/`
    <div class="not-found-container">
      <div class="content">
        <div class="error-code">404</div>
        <h1 class="error-title">Oops! Page Not Found</h1>
        <p class="error-message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div class="illustration">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill="#f0f0f0" />
            <circle cx="75" cy="85" r="8" fill="#666" />
            <circle cx="125" cy="85" r="8" fill="#666" />
            <path d="M 70 130 Q 100 110 130 130" stroke="#666" stroke-width="4" fill="none" stroke-linecap="round"/>
          </svg>
        </div>
        <button class="home-btn" (click)="goHome()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Back to Home
        </button>
      </div>
    </div>
  `,
  styles: [/*css*/`
    .not-found-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .content {
      text-align: center;
      background: white;
      padding: 3rem 2rem;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 100%;
      animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .error-code {
      font-size: 8rem;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
      line-height: 1;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }

    .error-title {
      font-size: 2rem;
      color: #333;
      margin: 1rem 0;
      font-weight: 600;
    }

    .error-message {
      color: #666;
      font-size: 1.1rem;
      margin: 1rem 0 2rem 0;
      line-height: 1.6;
    }

    .illustration {
      margin: 2rem 0;
    }

    .illustration svg {
      width: 150px;
      height: 150px;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    .home-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      font-size: 1.1rem;
      font-weight: 600;
      border-radius: 50px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .home-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }

    .home-btn:active {
      transform: translateY(0);
    }

    .home-btn svg {
      transition: transform 0.3s ease;
    }

    .home-btn:hover svg {
      transform: translateX(-3px);
    }

    @media (max-width: 600px) {
      .content {
        padding: 2rem 1.5rem;
      }

      .error-code {
        font-size: 6rem;
      }

      .error-title {
        font-size: 1.5rem;
      }

      .error-message {
        font-size: 1rem;
      }

      .illustration svg {
        width: 120px;
        height: 120px;
      }

      .home-btn {
        padding: 0.875rem 1.75rem;
        font-size: 1rem;
      }
    }
  `]
})
export class NotFoundComponent {
  constructor(private router: Router) {}

  goHome() {
    const token = localStorage.getItem('token');
    
    if (token) {
      this.router.navigate(['/feed']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}