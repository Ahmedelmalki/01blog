import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';

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
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterLink],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.css']
})

export class PostCardComponent {
  faThumbsUp = faThumbsUp;
  faThumbsDown = faThumbsDown;

  @Input() postResponse!: PostResponse;
  @Output() reactionChanged = new EventEmitter<{ postId: number, value: number }>();

  userReaction: number | undefined = undefined;

  constructor(private http: HttpClient, private router: Router) { }


  toggleLike() {
    this.toggleReaction(1);
  }


  toggleDislike() {
    this.toggleReaction(-1);
  }


  toggleReaction(val: number) {
    const token = localStorage.getItem('token');
    console.log("token :", token);
    

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });


    this.http.post(
      `http://localhost:8080/posts/${this.postResponse.post.id}/like?value=${val}`,
      {},
      { headers }
    ).subscribe({
      next: () => {
        const currentReaction = this.userReaction;


        if (currentReaction === val) {
          this.userReaction = undefined;
          if (val === 1) {
            this.postResponse.likesCount--;
          } else {
            this.postResponse.dislikesCount--;
          }
        }

        else {

          if (currentReaction !== undefined) {
            if (currentReaction === 1) {
              this.postResponse.likesCount--;
            } else {
              this.postResponse.dislikesCount--;
            }
          }


          this.userReaction = val;
          if (val === 1) {
            this.postResponse.likesCount++;
          } else {
            this.postResponse.dislikesCount++;
          }
        }


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


  isLiked(): boolean {
    return this.userReaction === 1;
  }


  isDisliked(): boolean {
    return this.userReaction === -1;
  }


  isVideo(url: string): boolean {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.mov'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext));
  }
}