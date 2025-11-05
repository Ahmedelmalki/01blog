import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent {
  title = '';
  content = '';
  mediaLink = '';
  selectedFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;
  isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  mediaPreview: string | null = null;
  mediaType: 'image' | 'video' | null = null;

  constructor(private http: HttpClient, private router: Router) { }

  // Handle file selection from input
  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    // Validate file type
    if (!this.isValidFileType(file.type)) {
      this.errorMessage = 'Invalid file type. Only images (jpg, png, gif) and videos (mp4, webm, mov) are allowed.';
      return;
    }

    const maxSize = file.type.startsWith('image/') ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxSizeMB = file.type.startsWith('image/') ? '10MB' : '50MB';
      this.errorMessage = `File size exceeds maximum limit of ${maxSizeMB}`;
      return;
    }

    this.selectedFile = file;
    this.errorMessage = null;
    this.mediaType = file.type.startsWith('image/') ? 'image' : 'video';

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.mediaPreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Upload file to backend
  async uploadFile(): Promise<string | null> {
    if (!this.selectedFile) {
      return null;
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return null;
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    try {
      // Upload file
      const response: any = await this.http.post(
        'http://localhost:8080/api/files/upload',
        formData,
        { headers }
      ).toPromise(); // the code editor says that this method is deprecated

      this.isUploading = false;
      console.log('✅ File uploaded:', response);

      // Return the full URL with domain for consistency
      return `http://localhost:8080${response.url}`;
    } catch (error: any) {
      console.error('❌ File upload failed:', error);
      this.isUploading = false;
      this.errorMessage = error.error?.message || 'Failed to upload file';
      return null;
    }
  }


  // Submit new post to backend
  async createPost() {
    // Reset messages
    this.successMessage = null;
    this.errorMessage = null;

    // Validate form
    if (!this.isFormValid()) {
      this.errorMessage = 'Title and content are required.';
      return;
    }

    // Get JWT token
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // Upload file if selected
    if (this.selectedFile) {
      const uploadedUrl = await this.uploadFile();
      if (!uploadedUrl) {
        return; // Upload failed, error already shown
      }
      this.mediaLink = uploadedUrl;
    }

    // Set loading state
    this.isSubmitting = true;

    // Prepare post payload
    const postPayload = {
      title: this.title.trim(),
      content: this.content.trim(),
      mediaLink: this.mediaLink.trim() || null
    };

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    console.log("headres ==>", headers);


    // POST request to create post
    this.http.post('http://localhost:8080/posts', postPayload, { headers })
      .subscribe({
        next: (response: any) => {
          console.log('✅ Post created successfully:', response);
          this.successMessage = 'Post created successfully!';
          this.isSubmitting = false;

          this.clearForm();

          setTimeout(() => {
            this.router.navigate(['/feed']);
          }, 1500);
        },
        error: (err) => {
          console.error('❌ Failed to create post:', err);
          this.isSubmitting = false;

          if (err.status === 401) {
            this.errorMessage = 'Session expired. Please login again.';
            localStorage.removeItem('token');
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.errorMessage = err.error?.message || 'Failed to create post. Please try again.';
          }
        }
      });
  }

  // =========== HELPERS ===========
  isValidFileType(type: string): boolean {
    const validTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'video/mp4', 'video/webm', 'video/quicktime'
    ];
    return validTypes.includes(type);
  }

  removeFile() {
    this.selectedFile = null;
    this.mediaPreview = null;
    this.mediaType = null;
    this.mediaLink = '';
  }

  isFormValid(): boolean {
    return this.title.trim().length > 0 && this.content.trim().length > 0;
  }

  clearForm() {
    this.title = '';
    this.content = '';
    this.mediaLink = '';
    this.selectedFile = null;
    this.mediaPreview = null;
    this.mediaType = null;
  }

  cancel() {
    this.router.navigate(['/feed']);
  }
}