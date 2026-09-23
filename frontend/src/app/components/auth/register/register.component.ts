import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Department } from '../../../models/department';
import { AuthService, RegistrationChallenge } from '../../../services/auth.service';
import { DepartmentService } from '../../../services/department.service';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { BrandLogoComponent } from '../../shared/brand-logo/brand-logo.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, BrandLogoComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit, OnDestroy {
  departments: Department[] = [];
  errorMessage = '';
  completed = false;
  challenge: RegistrationChallenge | null = null;
  verificationEmail = '';
  busy = false;
  private resendTimer?: ReturnType<typeof setTimeout>;
  readonly verificationForm = new FormGroup({
    code: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[0-9]{6}$/)] }),
  });
  readonly registerForm = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    employeeId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    phoneNumber: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    active: new FormControl(true, { nonNullable: true }),
    departmentId: new FormControl(0, { nonNullable: true, validators: [Validators.min(1)] }),
    roleIds: new FormControl<number[]>([], { nonNullable: true }),
  });

  constructor(
    private readonly authService: AuthService,
    private readonly departmentService: DepartmentService,
    private readonly cdr: ChangeDetectorRef,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    try {
      const saved = JSON.parse(sessionStorage.getItem('helpdesk_registration') || 'null');
      if (saved?.challenge?.registrationId) {
        this.verificationEmail = saved.email;
        this.saveChallenge(saved.challenge);
      }
    } catch { sessionStorage.removeItem('helpdesk_registration'); }
    this.departmentService.getAll().subscribe({
      next: (departments) => { this.departments = departments; this.cdr.markForCheck(); },
      error: () => { this.errorMessage = 'Unable to load departments.'; this.cdr.markForCheck(); },
    });
  }

  ngOnDestroy(): void { clearTimeout(this.resendTimer); }

  get canResend(): boolean {
    return !!this.challenge && Date.now() >= Date.parse(this.challenge.resendAvailableAt);
  }

  onRegister(): void {
    if (this.busy) return;
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Please fill in all required fields. Passwords must contain at least 8 characters.';
      return;
    }
    const value = this.registerForm.getRawValue();
    this.busy = true;
    this.errorMessage = '';
    this.verificationEmail = value.email;
    this.authService.register({ ...value, departmentId: Number(value.departmentId), roleIds: value.roleIds.map(Number) }).subscribe({
      next: (challenge) => {
        this.saveChallenge(challenge);
        this.registerForm.controls.password.reset();
        this.toast.success('Check your email for your verification code.');
      },
      error: (error) => this.handleError(error, 'Unable to register.'),
    });
  }

  onVerify(): void {
    if (this.busy || !this.challenge) return;
    if (this.verificationForm.invalid) {
      this.verificationForm.markAllAsTouched();
      return;
    }
    this.busy = true;
    this.errorMessage = '';
    this.authService.verifyRegistration(this.challenge.registrationId, this.verificationForm.controls.code.value).subscribe({
      next: () => {
        this.completed = true;
        this.challenge = null;
        this.verificationForm.reset();
        this.registerForm.reset();
        sessionStorage.removeItem('helpdesk_registration');
        this.busy = false;
        this.cdr.markForCheck();
      },
      error: (error) => this.handleError(error, 'Unable to verify your email.'),
    });
  }

  onResend(): void {
    if (this.busy || !this.challenge || !this.canResend) return;
    this.busy = true;
    this.errorMessage = '';
    this.authService.resendRegistration(this.challenge.registrationId).subscribe({
      next: (challenge) => {
        this.saveChallenge(challenge);
        this.verificationForm.reset();
        this.toast.success('A new verification code has been sent.');
      },
      error: (error) => this.handleError(error, 'Unable to resend the code.'),
    });
  }

  startOver(): void {
    this.challenge = null;
    this.errorMessage = '';
    sessionStorage.removeItem('helpdesk_registration');
  }

  private saveChallenge(challenge: RegistrationChallenge): void {
    this.challenge = challenge;
    this.busy = false;
    sessionStorage.setItem('helpdesk_registration', JSON.stringify({ challenge, email: this.verificationEmail }));
    clearTimeout(this.resendTimer);
    this.resendTimer = setTimeout(() => this.cdr.markForCheck(), Math.max(0, Date.parse(challenge.resendAvailableAt) - Date.now()) + 100);
    this.cdr.markForCheck();
  }

  private handleError(error: unknown, fallback: string): void {
    this.busy = false;
    this.errorMessage = this.toast.getErrorMessage(error, fallback);
    this.cdr.markForCheck();
  }
}
