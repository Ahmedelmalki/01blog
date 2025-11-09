import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { DarkModeService } from '../../services/dark-mode.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  errorMessage: string | null = null;
  isDarkMode = false;
  faMoon = faMoon;
  faSun = faSun;

  constructor(private http: HttpClient, private router: Router, private darkModeService: DarkModeService) { }

  ngOnInit() {
    this.darkModeService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  toggleDarkMode() {
    this.darkModeService.toggleDarkMode();
  }

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