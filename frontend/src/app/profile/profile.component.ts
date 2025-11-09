import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { PostCardComponent } from '../shared/post-cards/post-card.component';
import { PostResponse, UserInfo } from '../models/post.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, PostCardComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userInfo: UserInfo | null = null;
  posts: PostResponse[] = [];
  isLoadingUser = true;
  isLoadingPosts = true;
  errorMessage: string | null = null;
  username: string = '';

  constructor(
    private http: HttpClient, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.username = params['username'];
      if (this.username) {
        this.loadUserPosts();
      } else {
        this.loadCurrentUserProfile();
      }
    });
  }

  loadCurrentUserProfile() {
    const token = localStorage.getItem('token');    
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.router.navigate(['/feed']);
  }
  
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

    
    this.http.get<PostResponse[]>(
      `http://localhost:8080/posts/user/${this.username}`, 
      { headers }
    ).subscribe({
      next: (data) => {
        console.log('User posts loaded:', data);
        this.posts = data;
        this.isLoadingPosts = false;
        
        if (data.length > 0) {
          this.userInfo = {
            username: data[0].post.author.username,
            firstname: data[0].post.author.firstname,
            lastname: data[0].post.author.lastname,
            email: '' 
          };
          this.isLoadingUser = false;
        }
      },
      error: (err) => {
        console.error('Failed to load user posts:', err);
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

  onReactionChanged(event: { postId: number, value: number }) {
    console.log(`Post ${event.postId} reaction changed to ${event.value}`);
  }
 
  goToFeed() {
    this.router.navigate(['/feed']);
  }
}