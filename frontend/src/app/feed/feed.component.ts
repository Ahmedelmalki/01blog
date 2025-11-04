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
  posts: PostResponse[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.isLoading = true;
    this.errorMessage = null;

    const token = localStorage.getItem('token');
    
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<PostResponse[]>('http://localhost:8080/posts', { headers })
      .subscribe({
        next: (data) => {
          console.log('✅ Posts loaded:', data);
          this.posts = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.log('❌ Failed to load posts:', err);
          this.errorMessage = 'Failed to load posts. Please try again.';
          this.isLoading = false;
          
          if (err.status === 401) {
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
          }
        }
      });
  } // ========= END METHOD ==========

  userReactions : Map<number, number> = new Map();
  
  toggleLike(postId: number){
    this.toggleReaction(postId, 1);
  }

  toggleDislike(postId: number){
    this.toggleReaction(postId, -1);
  }

  toggleReaction(postId: number, val: number){
    const token = localStorage.getItem('token');
    if (!token){
      this.router.navigate(['/login']);
      return;
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    this.http.post(      
    `http://localhost:8080/posts/${postId}/like?vale=${val}`,
    {},
    { headers }).subscribe({
        next: () => {
          const currentReaction = this.userReactions.get(postId);
          
          const post = this.posts.find(p => p.post.id == postId);
          if (!post) return;
          if (currentReaction == val){ // Remove reaction
            this.userReactions.delete(postId);
            if (val == 1){
              post.likesCount--;
            } else {
              post.dislikesCount--;
            }
          } else { // If switching from opposite reaction
            if (currentReaction !== undefined){
              if (currentReaction == 1){
                post.likesCount--; // +?
              } else {
                post.dislikesCount--;
              }
            }
            this.userReactions.set(postId, val);
            if (val === 1){
              post.likesCount++;
            } else {
              post.dislikesCount++;
            }
          }
          
        }, 
        error: (err) => {
            console.log('❌ Failed to toggle reaction:', err);
        }
      });
  }

    // Check if post is liked by user
  isLiked(postId: number): boolean {
    return this.userReactions.get(postId) === 1;
  }

  // Check if post is disliked by user
  isDisliked(postId: number): boolean {
    return this.userReactions.get(postId) === -1;
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}