import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });
  submitting = false;
  successMessage = '';

  constructor(private readonly authService: AuthService) {}

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.successMessage = '';
    this.authService.forgotPassword(this.form.getRawValue()).subscribe({
      next: (message) => {
        this.submitting = false;
        this.successMessage = message;
        this.form.reset({ email: '' });
      },
      error: () => {
        this.submitting = false;
        // Keep the response generic so the UI never discloses account existence.
        this.successMessage = 'If an account exists for that email, a password reset link has been sent.';
      },
    });
  }
}
