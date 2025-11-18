import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { PostCardComponent } from '../shared/post-cards/post-card.component';
import { PostResponse } from '../models/post.models';
import { faSun, faMoon, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { DarkModeService } from '../services/dark-mode.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// <i class="fa-solid fa-chart-bar"></i>

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
  faChartBar = faChartBar;
  isAdmin = false;

  constructor(private http: HttpClient,
    private router: Router,
    private darkModeService: DarkModeService
  ) { }

  ngOnInit() {
    this.loadPosts();
    this.darkModeService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    })
    this.checkAdminStatus();

  }

checkAdminStatus() {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // console.log("Full payload:", payload); // Log entire payload
      // console.log("Roles type:", typeof payload.roles); // Check type
      // console.log("Roles value:", payload.roles); // Check value
      // console.log("Is array?", Array.isArray(payload.roles)); // Verify it's an array

      // Check if user has ADMIN role
      if (payload.roles && Array.isArray(payload.roles)) {
        this.isAdmin = payload.roles.includes('ADMIN');
        // console.log("Is admin?", this.isAdmin);
      } else {
        console.warn("Roles not found or not an array");
      }
    } catch (e) {
      console.error('Failed to decode token', e);
    }
  }
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
          console.log('✅ Posts loaded ===============>', data[0].authorProfileLink);
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

  toggleDarkMode() {
    this.darkModeService.toggleDarkMode();
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}