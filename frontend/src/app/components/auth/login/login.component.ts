import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  loginRequest: LoginRequest | null = null;
  loginResponse: LoginResponse | null = null;
  errorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }
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
    if (error.status === 401) {
      return 'Invalid login credentials. Please try again.';
    }

    if (error.error && typeof error.error.message === 'string') {
      return error.error.message;
    }

    return 'Unable to sign in. Please try again.';
  }
}
