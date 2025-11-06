import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    this.errorMessage = null;

    const payload = {
      username: this.username,
      password: this.password
    };

    this.http.post('http://localhost:8080/auth/login', payload)
      .subscribe({
        next: (res: any) => {
          console.log('Login successful:', res);
          if (res.token) {
            localStorage.setItem('token', res.token);
          }
          
          this.router.navigate(['/feed']);
        },
        error: (err) => {
          console.log('Login failed:', err);
          this.errorMessage = err.error?.message || 'Invalid username or password.';
        }
      });
  }
}