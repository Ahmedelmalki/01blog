import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  firstname = '';
  lastname = '';
  username = '';
  email = '';
  password = '';
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private http: HttpClient) {}

  register() {
    this.successMessage = null;
    this.errorMessage = null;

    const payload = {
      firstname: this.firstname,
      lastname: this.lastname,
      username: this.username,
      email: this.email,
      password: this.password
    };

    this.http.post('http://localhost:8080/auth/register', payload)
      .subscribe({
        next: (res) => {
          console.log('✅ Registration successful:', res);
          this.successMessage = 'Registration successful!';
          this.clearForm();
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
  }
}
