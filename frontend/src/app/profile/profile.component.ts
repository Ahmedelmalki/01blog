import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { PostCardComponent } from '../shared/post-cards/post-card.component';

// Interface for PostResponse
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

// Interface for User info
interface UserInfo {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, PostCardComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  // User information
  userInfo: UserInfo | null = null;
  
  // Posts by this user
  posts: PostResponse[] = [];
  
  // Loading states
  isLoadingUser = true;
  isLoadingPosts = true;
  
  // Error messages
  errorMessage: string | null = null;
  
  // Username from route parameter
  username: string = '';

  constructor(
    private http: HttpClient, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get username from route parameter (e.g., /profile/john)
    this.route.params.subscribe(params => {
      this.username = params['username'];
      if (this.username) {
        this.loadUserPosts();
      } else {
        // If no username in URL, show current user's profile
        this.loadCurrentUserProfile();
      }
    });
  }

  // Load current logged-in user's profile
  loadCurrentUserProfile() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // Extract username from token or fetch from backend
    // For now, we'll just redirect to feed if no username
    this.router.navigate(['/feed']);
  }

  // Load posts by specific username
  loadUserPosts() {
    this.isLoadingPosts = true;
    this.errorMessage = null;

    const token = localStorage.getItem('token');
    
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Fetch posts by username
    this.http.get<PostResponse[]>(
      `http://localhost:8080/posts/user/${this.username}`, 
      { headers }
    ).subscribe({
      next: (data) => {
        console.log('✅ User posts loaded:', data);
        this.posts = data;
        this.isLoadingPosts = false;
        
        // Extract user info from first post
        if (data.length > 0) {
          this.userInfo = {
            username: data[0].post.author.username,
            firstname: data[0].post.author.firstname,
            lastname: data[0].post.author.lastname,
            email: '' // Email not in post response
          };
          this.isLoadingUser = false;
        }
      },
      error: (err) => {
        console.error('❌ Failed to load user posts:', err);
        this.errorMessage = 'Failed to load user profile. Please try again.';
        this.isLoadingPosts = false;
        this.isLoadingUser = false;
        
        if (err.status === 401) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  // Optional: Handle reaction changes
  onReactionChanged(event: { postId: number, value: number }) {
    console.log(`Post ${event.postId} reaction changed to ${event.value}`);
  }

  // Navigate back to feed
  goToFeed() {
    this.router.navigate(['/feed']);
  }
}