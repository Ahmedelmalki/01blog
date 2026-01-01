import { Component, OnInit, HostListener } from '@angular/core';
import { FEED_IMPORTS } from './feed.imports';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { PostResponse } from '../models/post.models';
import { faSun, faMoon, faChartBar, faSignOutAlt, faPen } from '@fortawesome/free-solid-svg-icons';
import { DarkModeService } from '../services/dark-mode.service';
import { PostsResponse } from '../models/post.models';
import { UserInfo } from '../models/post.models';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [FEED_IMPORTS],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {
  posts: PostResponse[] = [];
  errorMessage: string | null = null;
  
  isLoading = true;
  isLoadingMore = false;
  isDarkMode = false;
  isAdmin = false;
  
  faMoon = faMoon;
  faSun = faSun;
  faChartBar = faChartBar;
  faSignOutAlt = faSignOutAlt;
  faPen = faPen;

  userInfo: UserInfo | null = null; 
  currentUsername: string = ''; 

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
    this.loadCurrentUserInfo();
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
        if (payload.roles && Array.isArray(payload.roles)) {
          this.isAdmin = payload.roles.includes('ADMIN');
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
      ? `/api/posts/following?page=${this.currentPage}&size=${this.pageSize}`
      : `/api/posts?page=${this.currentPage}&size=${this.pageSize}`;


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
      ? `/api/posts/following?page=${this.currentPage}&size=${this.pageSize}`
      : `/api/posts?page=${this.currentPage}&size=${this.pageSize}`;

    this.http.get<PostsResponse>(endpoint, { headers })
      .subscribe({
        next: (response) => {
          this.posts = response.posts;
          this.hasMorePosts = response.hasNext;
          this.isLoading = false;
        },
        error: (err) => {
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

  loadCurrentUserInfo() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUsername = payload.sub; 
    } catch (e) {
      console.error('Failed to decode token', e);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<UserInfo>('/api/users/me', { headers }).subscribe({
      next: (data) => {
        this.userInfo = data;
      },
      error: (err) => {
        console.error('Failed to load user info:', err);
      }
    });
  }

  goToMyProfile() {
    if (this.currentUsername) {
      this.router.navigate(['/profile', this.currentUsername]);
    }
  }

}