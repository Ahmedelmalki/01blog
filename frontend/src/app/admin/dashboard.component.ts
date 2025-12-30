import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserReport, PostReport } from '../models/post.models';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userReports: UserReport[] = [];
  postReports: PostReport[] = [];
  expandedUserReport: number | null = null;
  expandedPostReport: number | null = null;
  loading = true;
  errorMessage: string | null = null;
  faTrash = faTrash;


  constructor(
    private http: HttpClient,
    private router: Router,
  ) { }

  ngOnInit() {
    this.fetchReports();
  }

  fetchReports() {
    this.loading = true;
    this.errorMessage = null;
    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const url = 'http://localhost:8080/reports';

    this.http.get<any[]>(url, { headers })
      .subscribe({
        next: (data) => {
          this.userReports = data.filter(r => r.reportedUser !== null);
          this.postReports = data.filter(r => r.reportedPost !== null);
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load reports:', err);
          this.errorMessage = 'Failed to load reports. Please try again.';
          this.loading = false;

          if (err.status === 401 || err.status === 403) {
            this.router.navigate(['/feed']);
          }
        }
      });
  }

  toggleUserReport(reportId: number) {
    this.expandedUserReport = this.expandedUserReport === reportId ? null : reportId;
  }

  togglePostReport(reportId: number) {
    this.expandedPostReport = this.expandedPostReport === reportId ? null : reportId;
  }

  banUser(userId: number) {
    if (!confirm('Are you sure you want to ban this user?')) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const url = `http://localhost:8080/admin/users/${userId}/ban`;

    this.http.put(url, {}, { headers })
      .subscribe({
        next: () => {
          alert('User banned successfully');
          this.fetchReports();
        },
        error: (err) => {
          console.error('Failed to ban user:', err);
          alert('Failed to ban user. Please try again.');
        }
      });
  }

  unbanUser(userId: number) {
    if (!confirm('Are you sure you want to unban this user?')) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const url = `http://localhost:8080/admin/users/${userId}/unban`;
    this.http.put(url, {}, { headers })
      .subscribe({
        next: () => {
          alert('User unbanned successfully');
          this.fetchReports();
        },
        error: (err) => {
          console.error('Failed to unban user:', err);
          alert('Failed to unban user. Please try again.');
        }
      });
  }

  deleteUser(userId: number) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const url = `http://localhost:8080/admin/users/${userId}`;

    this.http.delete(url, { headers })
      .subscribe({
        next: () => {
          alert('User deleted successfully');
          this.fetchReports();
        },
        error: (err) => {
          console.error('Failed to delete user:', err);
          alert('Failed to delete user. Please try again.');
        }
      });
  }

  deletePost(postId: number) {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const url = `http://localhost:8080/admin/posts/${postId}`;
    this.http.delete(url, { headers })
      .subscribe({
        next: () => {
          alert('Post deleted successfully');
          this.fetchReports();
        },
        error: (err) => {
          console.error('Failed to delete post:', err);
          alert('Failed to delete post. Please try again.');
        }
      });
  }

  isUserBanned(state: number): boolean {
    return state === -1;
  }

  goBack() {
    this.router.navigate(['/feed']);
  }
}