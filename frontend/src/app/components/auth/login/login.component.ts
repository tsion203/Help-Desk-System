import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LoginRequest } from '../../../models/auth-request';
import { LoginResponse } from '../../../models/auth-response';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  readonly loginForm = new FormGroup({
    email: new FormControl('', { nonNullable: true }),
    password: new FormControl('', { nonNullable: true }),
  });

  loginRequest: LoginRequest | null = null;
  loginResponse: LoginResponse | null = null;
  errorMessage = '';

  constructor(private readonly authService: AuthService) {}

  onLogin(): void {
    this.loginRequest = this.loginForm.getRawValue();
    this.errorMessage = '';
    this.authService.login(this.loginRequest).subscribe({
      next: (response) => (this.loginResponse = response),
      error: () => (this.errorMessage = 'Unable to sign in.'),
    });
  }
}
