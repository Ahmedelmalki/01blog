import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';

// Interface to match your PostResponse from backend
interface PostResponse {
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
}

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterLink],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {
  faThumbsUp = faThumbsUp;
  faThumbsDown = faThumbsDown;
  // Array to hold all posts from the API
  posts: PostResponse[] = [];
  
  // Loading state for better UX
  isLoading = true;
  
  // Error message if API call fails
  errorMessage: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    // Load posts when component initializes
    this.loadPosts();
  }

  // Fetch all posts from backend
  loadPosts() {
    this.isLoading = true;
    this.errorMessage = null;

    // Get JWT token from localStorage (saved during login)
    const token = localStorage.getItem('token');
    
    // If no token, redirect to login
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // Set up authorization header with Bearer token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Call GET /posts endpoint
    this.http.get<PostResponse[]>('http://localhost:8080/posts', { headers })
      .subscribe({
        next: (data) => {
          console.log('✅ Posts loaded:', data);
          this.posts = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('❌ Failed to load posts:', err);
          this.errorMessage = 'Failed to load posts. Please try again.';
          this.isLoading = false;
          
          // If unauthorized (401), redirect to login
          if (err.status === 401) {
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
          }
        }
      });
  }

  // Logout function - clears token and redirects
  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}