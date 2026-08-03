import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ForgotPasswordRequest, LoginRequest, RegisterRequest, ResetPasswordRequest } from '../models/auth-request';
import { LoginResponse } from '../models/auth-response';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'helpdesk_jwt';
  private readonly roleKey = 'helpdesk_role';
  private readonly emailKey = 'helpdesk_email';
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  constructor(private readonly http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  register(user: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, user);
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/forgot-password`, request, { responseType: 'text' });
  }

  resetPassword(request: ResetPasswordRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/reset-password`, request, { responseType: 'text' });
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  saveRole(role: string): void {
    localStorage.setItem(this.roleKey, this.normalizeRole(role));
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  saveEmail(email: string): void { localStorage.setItem(this.emailKey, email); }
  getEmail(): string { return localStorage.getItem(this.emailKey) ?? '';
  }

  isAdmin(): boolean { return this.getRole() === 'ADMIN'; }
  isSupervisor(): boolean { return this.getRole() === 'SUPERVISOR'; }
  isSupportOfficer(): boolean { return this.getRole() === 'SUPPORT_OFFICER'; }
  isEmployee(): boolean { return this.getRole() === 'EMPLOYEE'; }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.emailKey);
  }

  private normalizeRole(role: string): string {
    return (role || '').replace(/^ROLE_/, '').toUpperCase();
  }
}
