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

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      console.log('==>',params);
      
      this.username = params['username']; // what is this
      if (this.username) {
        this.loadUserPosts();
      } else {
        this.loadCurrentUserProfile();
      }
    });
  }

  loadCurrentUserProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.router.navigate(['/feed']);
  }

  loadUserPosts() {
    this.isLoadingPosts = true;
    this.errorMessage = null;
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const url = `api/posts/user/${this.username}`;

    this.http.get<PostsResponse>(url, { headers }).subscribe({
      next: (data) => {
        this.posts = data.posts;
        this.isLoadingPosts = false;

        if (this.posts.length > 0) {
          this.userInfo = {
            username: this.posts[0].author, 
            firstname: '',
            lastname: '',
            email: '',
            profileLink: this.posts[0].authorProfileLink,
          };
          this.isLoadingUser = false;
        }
      },
      error: (err) => {
        console.error('Failed to load user posts:', err);
        this.errorMessage = 'Failed to load user profile. Please try again.';
        this.isLoadingPosts = false;
        this.isLoadingUser = false;

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