import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { PostResponse, PostsResponse, UserInfo } from '../models/post.models';
import { faFlag } from '@fortawesome/free-solid-svg-icons';
import { PROFILE_IMPORTS } from './profile.imports';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [PROFILE_IMPORTS],
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
  faFlag = faFlag;
  showMenu = false;
  currentUsername: string = '';
  isLoadingMorePosts = false;

  currentPage = 0;
  pageSize = 10;
  hasMore = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.username = params['username'];
      this.handleRouteChange();
    });
  }

  private handleRouteChange() {
    if (this.username) {
      this.loadProfileCard();
      this.loadUserPosts();
    } else {
      this.loadCurrentUserProfile();
    }
  }

  loadCurrentUserProfile() { // why this method
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.router.navigate(['/feed']);
  }

  getHeaders(): HttpHeaders | null {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return null;
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  loadProfileCard() {
    const headers = this.getHeaders();
    if (!headers) return;
    this.http.get<UserInfo>(`/api/users/${this.username}`, { headers }).subscribe({
      next: (user) => {
        this.userInfo = user;
        this.isLoadingUser = false;
      },
      error: (err) => {
        console.error('Failed to load user info:', err);
        this.isLoadingUser = false;
        if (err.status === 401) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      }
    });

  }

  loadUserPosts(loadMore = false) {
    if (loadMore) {
      this.isLoadingMorePosts = true;
    } else {
      this.isLoadingPosts = true;
      this.currentPage = 0;
      this.posts = [];
    }

    this.errorMessage = null;
    const headers = this.getHeaders();
    if (!headers) return;
    const url = `api/posts/user/${this.username}?page=${this.currentPage}&size=${this.pageSize}`;

    this.http.get<PostsResponse>(url, { headers }).subscribe({
      next: (data) => {
        if (loadMore) {
          this.posts = [...this.posts, ...data.posts];
        } else {
          this.posts = data.posts;
        }
        this.hasMore = data.posts.length === this.pageSize;

        this.isLoadingPosts = false;
        this.isLoadingMorePosts = false;
      },
      error: (err) => {
        console.log('Failed to load user posts:', err);
        this.errorMessage = 'Failed to load user posts. Please try again.';
        this.isLoadingPosts = false;

        if (err.status === 401) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  loadMorePosts() {
    if (!this.isLoadingMorePosts && this.hasMore) {
      this.currentPage++;
      this.loadUserPosts(true);
    }
  }

  @HostListener('window:scroll')
  onScroll() {
    const scrollPosition = window.pageYOffset + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= pageHeight - 500 && !this.isLoadingMorePosts && this.hasMore) {
      this.loadMorePosts();
    }
  }

  onReactionChanged(event: { postId: number, value: number }) {
    console.log(`Post ${event.postId} reaction changed to ${event.value}`);
  }

  goToFeed() {
    this.router.navigate(['/feed']);
  }

  isCurrentUser(): boolean {
    return this.currentUsername === this.username;
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.showMenu = !this.showMenu;
  }

  onReportUser() {
    this.showMenu = false;
    const reason = prompt('Please provide a reason for reporting this user:');
    if (reason && reason.trim()) {
      this.reportUser(reason.trim());
    }
  }

  private reportUser(reason: string) {
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
      reportedUsername: this.username,
      reportedPostId: null
    };

    this.http.post('/api/reports', reportRequest, { headers })
      .subscribe({
        next: () => {
          alert('Thank you for your report.')
        },
        error: (err) => {
          alert('Failed to submit report.');
          if (err.status === 401) {
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
          }
        }
      });
  }

  @HostListener('document:click')
  closeMenu() {
    this.showMenu = false;
  }
}