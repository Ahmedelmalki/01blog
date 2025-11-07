import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { PostResponse } from '../../models/post.models';
import { CommentsComponent } from '../comments/comments.component';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterLink, CommentsComponent ],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.css']
})
export class PostCardComponent implements OnInit{
  // Font Awesome icons
  faThumbsUp = faThumbsUp;
  faThumbsDown = faThumbsDown;

  // Input: Receives a single post from parent component
  @Input() postResponse!: PostResponse;

  // Output: Emits events when reactions change (so parent can update counts)
  @Output() reactionChanged = new EventEmitter<{ postId: number, value: number }>();

  // Track user's reaction to this post (1 = like, -1 = dislike, undefined = no reaction)
  userReaction: number | undefined = undefined;

  constructor(private http: HttpClient, private router: Router) {}

  // Toggle like button
  toggleLike() {
    this.toggleReaction(1);
  }

  ngOnInit() {
  this.userReaction = this.postResponse.userReaction ?? undefined;
}

  // Toggle dislike button
  toggleDislike() {
    this.toggleReaction(-1);
  }

  // Handle reaction toggle logic
  toggleReaction(val: number) {
    const token = localStorage.getItem('token');
    
    // Redirect to login if not authenticated
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Call backend API to save reaction
    this.http.post(
      `http://localhost:8080/posts/${this.postResponse.post.id}/like?value=${val}`,
      {},
      { headers }
    ).subscribe({
      next: () => {
        const currentReaction = this.userReaction;

        // Case 1: Clicking the same reaction (remove it)
        if (currentReaction === val) {
          this.userReaction = undefined;
          if (val === 1) {
            this.postResponse.likesCount--;
          } else {
            this.postResponse.dislikesCount--;
          }
        } 
        // Case 2: Switching from opposite reaction or adding new reaction
        else {
          // If there was a previous reaction, decrement it
          if (currentReaction !== undefined) {
            if (currentReaction === 1) {
              this.postResponse.likesCount--;
            } else {
              this.postResponse.dislikesCount--;
            }
          }
          
          // Set new reaction
          this.userReaction = val;
          if (val === 1) {
            this.postResponse.likesCount++;
          } else {
            this.postResponse.dislikesCount++;
          }
        }

        // Emit event to parent component (optional, for syncing)
        this.reactionChanged.emit({ 
          postId: this.postResponse.post.id, 
          value: this.userReaction || 0 
        });
      },
      error: (err) => {
        console.error('❌ Failed to toggle reaction:', err);
      }
    });
  }

  // Check if post is liked by current user
  isLiked(): boolean {
    return this.userReaction === 1;
  }

  // Check if post is disliked by current user
  isDisliked(): boolean {
    return this.userReaction === -1;
  }

  // Check if URL is a video
  isVideo(url: string): boolean {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.mov'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext));
  }
}