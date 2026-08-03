import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  readonly form = new FormGroup({
    newPassword: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  token = '';
  submitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token')?.trim() ?? '';
    if (!this.token) this.errorMessage = 'Invalid password reset link.';
  }

  onSubmit(): void {
    this.errorMessage = '';
    const value = this.form.getRawValue();
    if (!this.token) {
      this.errorMessage = 'Invalid password reset link.';
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (value.newPassword !== value.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.submitting = true;
    this.authService.resetPassword({ token: this.token, ...value }).subscribe({
      next: (message) => {
        this.submitting = false;
        this.successMessage = message;
        this.form.disable();
        window.setTimeout(() => void this.router.navigate(['/login']), 1500);
      },
      error: (error: HttpErrorResponse) => {
        this.submitting = false;
        this.errorMessage = this.apiError(error);
      },
    });
  }

  private apiError(error: HttpErrorResponse): string {
    if (error.error && typeof error.error.message === 'string') return error.error.message;
    return 'Unable to reset the password. The link may be invalid or expired.';
  }
}
