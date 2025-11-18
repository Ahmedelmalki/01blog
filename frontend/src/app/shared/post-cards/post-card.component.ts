import { Component, Input, Output, OnInit, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CommentsComponent } from '../comments/comments.component';
import { LikesComponent } from '../likes/likes.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PostResponse } from '../../models/post.models';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; 
import { faFlag, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterLink, CommentsComponent, LikesComponent, FontAwesomeModule],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.css']
})
export class PostCardComponent implements OnInit {
  @Input() postResponse!: PostResponse;
  @Output() postDeleted = new EventEmitter<number>();
  @Output() postUpdated = new EventEmitter<number>();

  showMenu = false;
  currentUsername: string = '';
  faFlag = faFlag;
  faPen = faPen;
  faTrash = faTrash;

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

  // Check if user can report (not their own post)
  canReportPost(): boolean {
    return this.currentUsername !== this.postResponse.author && this.currentUsername !== '';
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

    onReport() {
    console.log('Report post');
    this.showMenu = false;
    
    const reason = prompt('Please provide a reason for reporting this post:');
    
    if (reason && reason.trim()) {
      this.reportPost(reason.trim());
    }
  }

   private reportPost(reason: string) {
    const token = localStorage.getItem('token');
    
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const reportRequest = {
      reason: reason,
      reportedUserId: null,  // Not reporting a user, just a post
      reportedPostId: this.postResponse.id
    };

    this.http.post('http://localhost:8080/reports', reportRequest, { headers })
      .subscribe({
        next: (response: any) => {
          console.log('✅ Post reported successfully:', response);
          alert('Thank you for your report. Our team will review it shortly.');
        },
        error: (err) => {
          console.error('❌ Failed to report post:', err);
          alert('Failed to submit report. Please try again.');
          
          if (err.status === 401) {
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
          }
        }
      });
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

   /**
   * Get initial letter for avatar placeholder
   */
  getInitial(username: string): string {
    return username ? username.charAt(0).toUpperCase() : '?';
  }

  /**
   * Generate consistent color based on username
   */
  getAvatarColor(username: string): string {
    if (!username) return '#6c757d';
    
    // Generate hash from username
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Color palette
    const colors = [
      '#e57373', '#f06292', '#ba68c8', '#9575cd',
      '#7986cb', '#64b5f6', '#4fc3f7', '#4dd0e1',
      '#4db6ac', '#81c784', '#aed581', '#ff8a65'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  }
}