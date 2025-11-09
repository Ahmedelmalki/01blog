import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { DarkModeService } from '../../services/dark-mode.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit{ // will it work without implementing oninit????
  firstname = '';
  lastname = '';
  username = '';
  email = '';
  password = '';
  successMessage: string | null = null;
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
  }
}
