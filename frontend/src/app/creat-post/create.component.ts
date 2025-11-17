import { Component, OnInit } from '@angular/core';
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
    private route: ActivatedRoute
  ) { }

  // lifecycle hook
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

    this.http.get<any>(`http://localhost:8080/posts/${this.postId}`, { headers })
      .subscribe({
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
        this.http.post<{ url: string }>(
          'http://localhost:8080/api/files/upload',
          formData,
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
      console.error('File upload failed:', error);
      this.isUploading = false;
      this.errorMessage = 'Failed to upload file. Please try again.';

      if (error.status === 401) {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
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

    // Upload file if selected
    if (this.selectedFile) {
      const uploadedUrl = await this.uploadFile();
      if (uploadedUrl) {
        this.post.mediaLink = uploadedUrl;
      } else {
        // Upload failed, stop the submission
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

    const url = this.isEditMode
      ? `http://localhost:8080/posts/${this.postId}`
      : 'http://localhost:8080/posts';

    const method = this.isEditMode ? 'put' : 'post';

    this.http.request(method, url, {
      body: this.post,
      headers
    }).subscribe({
      next: (response) => {
        console.log(`✅ Post ${this.isEditMode ? 'updated' : 'created'}:`, response);
        this.successMessage = `Post ${this.isEditMode ? 'updated' : 'created'} successfully!`;
        this.isLoading = false;

        setTimeout(() => {
          this.router.navigate(['/feed']);
        }, 1500);
      },
      error: (err) => {
        console.error(`❌ Failed to ${this.isEditMode ? 'update' : 'create'} post:`, err);
        this.errorMessage = `Failed to ${this.isEditMode ? 'update' : 'create'} post. Please try again.`;
        this.isLoading = false;

        if (err.status === 401) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        } else if (err.status === 403) {
          this.errorMessage = 'You can only edit your own posts.';
        }
      }
    });
  }

  cancel() {
    this.router.navigate(['/feed']);
  }
}