import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
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

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  onLogin(): void {
    this.loginRequest = this.loginForm.getRawValue();
    this.errorMessage = '';
    this.authService.login(this.loginRequest).subscribe({
      next: (response) => {
        this.loginResponse = response;
        this.authService.saveToken(response.token);
        this.authService.saveRole(response.role);
        this.authService.saveEmail(response.email);
        void this.router.navigate([this.authService.isEmployee() ? '/tickets' : '/dashboard']);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(error);
        this.loginForm.controls.password.reset('');
      },
    });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (
      error.status === 401 ||
      (typeof error.error === 'string' &&
        error.error.toLowerCase().includes('unexpected error'))
    ) {
      return 'Invalid login credentials. Please try again.';
    }

    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    if (error.error && typeof error.error.message === 'string') {
      return error.error.message;
    }

    return error.message || 'Unable to sign in.';
  }
}
