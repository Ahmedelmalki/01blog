import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { faMoon, faSun, faCamera, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DarkModeService } from '../../services/dark-mode.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  firstname = '';
  lastname = '';
  username = '';
  email = '';
  profileLink = '';
  password = '';
  
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isDarkMode = false;
  faMoon = faMoon;
  faSun = faSun;
  faCamera = faCamera;
  faTrash = faTrash;

  // Profile picture related
  selectedFile: File | null = null;
  isUploading = false;
  previewUrl: string | null = null;

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private darkModeService: DarkModeService
  ) { }

  ngOnInit() {
    this.darkModeService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  toggleDarkMode() {
    this.darkModeService.toggleDarkMode();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select an image file';
        return;
      }

      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size must be less than 5MB';
        return;
      }

      this.selectedFile = file;
      this.errorMessage = null;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeProfilePic() {
    this.selectedFile = null;
    this.previewUrl = null;
    // Reset file input
    const fileInput = document.getElementById('profilePic') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getInitial(): string {
    return this.email ? this.email.charAt(0).toUpperCase() : '?';
  }

  getAvatarColor(): string {
    if (!this.email) return '#6c757d';
    
    // Generate consistent color based on email
    let hash = 0;
    for (let i = 0; i < this.email.length; i++) {
      hash = this.email.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      '#e57373', '#f06292', '#ba68c8', '#9575cd',
      '#7986cb', '#64b5f6', '#4fc3f7', '#4dd0e1',
      '#4db6ac', '#81c784', '#aed581', '#ff8a65'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  }

  async uploadProfilePicture(): Promise<string | null> {
    if (!this.selectedFile) return null;

    this.isUploading = true;
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    try {
      const response = await firstValueFrom(
        this.http.post<{ url: string }>(
          'http://localhost:8080/api/files/upload/public',
          formData,
          {
            headers: new HttpHeaders({
              'Authorization': token ? `Bearer ${token}` : ''
            })
          }
        )
      );

      this.isUploading = false;
      console.log('✅ Profile picture uploaded:', response.url);
      return response.url;
    } catch (error: any) {
      console.error('❌ Profile picture upload failed:', error);
      this.isUploading = false;
      this.errorMessage = 'Failed to upload profile picture. Please try again.';
      return null;
    }
  }

  async register() {
    this.successMessage = null;
    this.errorMessage = null;

    // Upload profile picture if selected
    if (this.selectedFile) {
      const uploadedUrl = await this.uploadProfilePicture();
      if (uploadedUrl) {
        this.profileLink = uploadedUrl;
      } else {
        // Upload failed, stop registration
        return;
      }
    }

    const payload = {
      firstname: this.firstname,
      lastname: this.lastname,
      username: this.username,
      email: this.email,
      password: this.password,
      profileLink: this.profileLink || '' // Send empty string if no profile pic
    };

    this.http.post('http://localhost:8080/auth/register', payload)
      .subscribe({
        next: (res) => {
          console.log('✅ Registration successful:', res);
          this.successMessage = 'Registration successful!';
          this.clearForm();
          this.router.navigate(['/feed']);
        },
        error: (err) => {
          console.error('❌ Registration failed:', err);
          this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
        }
      });
  }

  clearForm() {
    this.firstname = '';
    this.lastname = '';
    this.username = '';
    this.email = '';
    this.password = '';
    this.profileLink = '';
    this.selectedFile = null;
    this.previewUrl = null;
  }
}