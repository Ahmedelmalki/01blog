import { Component, Input, Output, OnInit, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CommentsComponent } from '../comments/comments.component';
import { LikesComponent } from '../likes/likes.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PostResponse } from '../../models/post.models';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterLink, CommentsComponent, LikesComponent],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.css']
})
export class PostCardComponent implements OnInit {
  @Input() postResponse!: PostResponse;
  @Output() postDeleted = new EventEmitter<number>();
  @Output() postUpdated = new EventEmitter<number>();

  showMenu = false;
  currentUsername: string = '';

  constructor(private http: HttpClient, private router: Router) { }
  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUsername = payload.sub || '';
      } catch (e) {
        console.error('ffailed to decode token', e);
      }
    }
  }

  isVideo(url: string): boolean {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.mov'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext));
  }

  canModifyPost(): boolean {
    return this.currentUsername ===
      this.postResponse.author;
  }

  toggleMenu(event: Event){
    event.stopPropagation();
    this.showMenu = !this.showMenu;
  }

  onUpdate(){
    console.log('update post');
    this.showMenu = false;
    this.router.navigate(['/post/edit', this.postResponse.id]);
  }

  onDelete(){
    console.log('delete post');
    this.showMenu = false;
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')){
      this.deletePost();
    }
  }

  private deletePost() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.delete(`http://localhost:8080/posts/${this.postResponse.id}`, { headers })
      .subscribe({
        next: () => {
          console.log('✅ Post deleted successfully');
          // Emit event to parent component to remove post from list
          this.postDeleted.emit(this.postResponse.id);
        },
        error: (err) => {
          console.error('❌ Failed to delete post:', err);
          alert('Failed to delete post. Please try again.');
          
          if (err.status === 401) {
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
          }
        }
      });
  }

  // Close menu when clicking outside
  @HostListener('document:click')
  closeMenu() {
    this.showMenu = false;
  }
}