import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {
  post = {
    title: '',
    content: '',
    mediaLink: ''
  };

  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  selectedFile: File | null = null;
  isUploading = false;

  isEditMode = false;
  postId: number | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.postId = +params['id'];
        this.loadPost();
      }
    });
  }

  loadPost() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const url = `/api/posts/${this.postId}`;

    this.http.get<any>(url, { headers }).subscribe({
      next: (response) => {
        this.post.title = response.post.title;
        this.post.content = response.post.content;
        this.post.mediaLink = response.post.mediaLink || '';
        console.log('Post loaded for editing:', response);
      },
      error: (err) => {
        console.error('Failed to load post:', err);
        this.errorMessage = 'Failed to load post. Please try again.';
        if (err.status === 401) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        } else if (err.status === 403) {
          this.errorMessage = 'You can only edit your own posts.';
          setTimeout(() => this.router.navigate(['/feed']), 2000);
        }
      }
    });
  }

  ifFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      console.log('File selected:', file.name);
    }
  }

  async uploadFile(): Promise<string | null> {
    if (!this.selectedFile) return null;

    this.isUploading = true;
    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/login']);
      return null;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    try {
      const response = await firstValueFrom(
        this.http.post<{ url: string }>('/api/files/upload', formData,
          {
            headers: new HttpHeaders({
              'Authorization': `Bearer ${token}`
            })
          }
        )
      );

      this.isUploading = false;
      console.log(' File uploaded:', response.url);
      return response.url;
    } catch (error: any) {
      this.ngZone.run(() => {
        this.isUploading = false;

        if (error.error && error.error.error) {
          this.errorMessage = error.error.error;
        } else if (error.status === 401) {
          this.errorMessage = 'Unauthorized. Please log in again.';
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        } else {
          this.errorMessage = 'Failed to upload file. Please try again.';
        }
      });
      return null;
    }
  }

  async onSubmit() {
    if (!this.post.title.trim() || !this.post.content.trim()) {
      this.errorMessage = 'Title and content are required.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (this.selectedFile) {
      const uploadedUrl = await this.uploadFile();
      if (uploadedUrl) {
        this.post.mediaLink = uploadedUrl;
      } else {
        this.isLoading = false;
        return;
      }
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const url = this.isEditMode ? `/api/posts/${this.postId}` : '/api/posts';
    const method = this.isEditMode ? 'put' : 'post';

    this.http.request(method, url, {
      body: this.post,
      headers
    }).subscribe({
      next: (response) => {
        console.log(`Post ${this.isEditMode ? 'updated' : 'created'}:`, response);
        this.successMessage = `Post ${this.isEditMode ? 'updated' : 'created'} successfully!`;
        this.isLoading = false;

        setTimeout(() => {
          this.router.navigate(['/feed']);
        }, 1500);
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;

        if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else if (err.status === 401) {
          this.errorMessage = 'Unauthorized. Please log in again.';
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        } else {
          this.errorMessage = 'Something went wrong. Please try again.';
        }
      }
    });
  }

  cancel() {
    this.router.navigate(['/feed']);
  }
}