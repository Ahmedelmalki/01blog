import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { PostCardComponent } from '../shared/post-cards/post-card.component';
import { PostResponse } from '../models/post.models';
import { faSun, faMoon, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { DarkModeService } from '../services/dark-mode.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; // TODO: remove this shit from here

interface PostsResponse {
  posts: PostResponse[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
}

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule,
    RouterLink,
    PostCardComponent,
    FontAwesomeModule],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {
  posts: PostResponse[] = [];
  isLoading = true;
  isLoadingMore = false;
  errorMessage: string | null = null;
  isDarkMode = false;
  faMoon = faMoon;
  faSun = faSun;
  faChartBar = faChartBar;
  isAdmin = false;

  activeTab: 'all' | 'following' = 'all';
  currentPage = 0;
  pageSize = 10;
  hasMorePosts = true;

  constructor(
    private http: HttpClient,
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

  switchTab(tab: 'all' | 'following') {
    if (this.activeTab === tab) return;

    this.activeTab = tab;
    this.loadPosts();
  }

  @HostListener('window:scroll')
  onScroll() {
    const scrollPosition = window.innerHeight + window.scrollY;
    const pageHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= pageHeight - 200 &&
      !this.isLoadingMore && this.hasMorePosts) {
      this.loadMorePosts();
    }
  }

  checkAdminStatus() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
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

  loadMorePosts() {
    if (this.isLoadingMore || !this.hasMorePosts) {
      return;
    }

    this.isLoadingMore = true;
    this.currentPage++;

    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const endpoint = this.activeTab === 'following'
      ? `http://localhost:8080/posts/following?page=${this.currentPage}&size=${this.pageSize}`
      : `http://localhost:8080/posts?page=${this.currentPage}&size=${this.pageSize}`;


    this.http.get<PostsResponse>(endpoint, { headers }).subscribe({
      next: (response) => {
        this.posts = [...this.posts, ...response.posts];
        this.hasMorePosts = response.hasNext;
        this.isLoadingMore = false;
      },
      error: (err) => {
        console.error('Failed to load more posts:', err);
        this.isLoadingMore = false;
        this.currentPage--; // Revert page increment on error
      }
    });
  }

  loadPosts() {
    this.isLoading = true;
    this.errorMessage = null;
    this.currentPage = 0;
    this.posts = [];

    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

        const endpoint = this.activeTab === 'following' 
      ? `http://localhost:8080/posts/following?page=${this.currentPage}&size=${this.pageSize}`
      : `http://localhost:8080/posts?page=${this.currentPage}&size=${this.pageSize}`;

    this.http.get<PostsResponse>(endpoint, { headers })
      .subscribe({
        next: (response) => {
          this.posts = response.posts;
          this.hasMorePosts = response.hasNext;
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