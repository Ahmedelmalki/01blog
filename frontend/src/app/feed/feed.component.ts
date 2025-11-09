import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { PostCardComponent } from '../shared/post-cards/post-card.component';
import { PostResponse } from '../models/post.models';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { DarkModeService } from '../services/dark-mode.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterLink, PostCardComponent, FontAwesomeModule],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {
  posts: PostResponse[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  isDarkMode = false;
  faMoon = faMoon;
  faSun = faSun;

  constructor(private http: HttpClient,
    private router: Router,
    private darkModeService: DarkModeService
  ) { }

  ngOnInit() {
    this.loadPosts();
    this.darkModeService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    })
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
          console.error('Failed to load posts:', err);
          this.errorMessage = 'Failed to load posts. Please try again.';
          this.isLoading = false;

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

  toggleDarkMode(){
    this.darkModeService.toggleDarkMode();
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}