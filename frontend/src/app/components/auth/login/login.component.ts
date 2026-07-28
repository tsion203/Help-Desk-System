import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LoginRequest } from '../../../models/auth-request';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  readonly loginForm = new FormGroup({
    email: new FormControl('', { nonNullable: true }),
    password: new FormControl('', { nonNullable: true }),
  });

  loginRequest: LoginRequest | null = null;
  errorMessage = '';

  onLogin(): void {
    this.loginRequest = this.loginForm.getRawValue();
  }
}
