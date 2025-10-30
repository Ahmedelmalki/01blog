import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,  // ← Make it standalone
  imports: [CommonModule, FormsModule],  // ← Import what you need
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  username: string = '';
  password: string = '';
  email: string = '';
  error: string | null = null;
  successMessage: string | null = null;

  constructor(private http: HttpClient) {}

  register() {
    this.error = null;
    this.successMessage = null;
    
    this.http.post<any>('http://localhost:8080/auth/register', {
      username: this.username,
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res) => {
        console.log('Registration successful', res);
        this.successMessage = 'Registration successful!';
        // Clear form
        this.username = '';
        this.email = '';
        this.password = '';
      },
      error: (err) => {
        this.error = err.error?.message || 'Registration failed';
        console.error(err);
      }
    });
  }

  login() {
    this.error = null;
    this.http.post<any>('http://localhost:8080/auth/login', {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (res) => {
        console.log('Login successful', res);
        // store token/session here
      },
      error: (err) => {
        this.error = 'Invalid username or password';
        console.error(err);
      }
    });
  }
}