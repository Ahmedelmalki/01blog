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
  imports: [CommonModule,
    FormsModule,
    FontAwesomeModule,
    RouterLink,
  ],
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
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select an image file';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size must be less than 5MB';
        return;
      }

      this.selectedFile = file;
      this.errorMessage = null;

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
    const fileInput = document.getElementById('profilePic') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async uploadProfilePicture(): Promise<string | null> {
    if (!this.selectedFile) return null;

    this.isUploading = true;
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    const url = 'http://localhost:8080/api/files/upload/public';

    try {
      const response = await firstValueFrom(
        this.http.post<{ url: string }>(url, formData, {
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

    if (!this.validateEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    const passwordCheck = this.validatePassword(this.password);
    if (!passwordCheck.valid) {
      this.errorMessage = passwordCheck.message;
      return;
    }

    if (this.selectedFile) {
      const uploadedUrl = await this.uploadProfilePicture();
      if (uploadedUrl) {
        this.profileLink = uploadedUrl;
      } else {
        return;
      }
    }

    const payload = {
      firstname: this.firstname,
      lastname: this.lastname,
      username: this.username,
      email: this.email,
      password: this.password,
      profileLink: this.profileLink || '', // Send empty string if no profile pic
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
  // =========== HELPERS ===========
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

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password: string): { valid: boolean; message: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain an uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain a lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain a number' };
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return { valid: false, message: 'Password must contain a special character (!@#$%^&*)' };
    }
    return { valid: true, message: '' };
  }
}