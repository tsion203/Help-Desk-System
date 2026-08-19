import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { Router } from '@angular/router';
import { User } from '../../../models/user';
import { ConfirmationService } from '../../../services/confirmation.service';

@Component({ selector: 'app-profile-form', standalone: true, imports: [CommonModule, ReactiveFormsModule], templateUrl: './profile-form.component.html', styleUrls: ['./profile-form.component.scss'] })
export class ProfileFormComponent implements OnInit {
  loading = true;
  currentUser: User | null = null;
  showEditForm = false;
  showPasswordForm = false;
  private originalEmail = '';
  readonly profileForm = new FormGroup({
    firstName: new FormControl('', { nonNullable: true }), lastName: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true }), phoneNumber: new FormControl('', { nonNullable: true }),
  });
  readonly passwordForm = new FormGroup({
    currentPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  constructor(private readonly users: UserService, private readonly auth: AuthService, private readonly toast: ToastService, private readonly router: Router, private readonly cdr: ChangeDetectorRef, private readonly confirmation: ConfirmationService) {}
  ngOnInit(): void { this.users.getCurrentProfile().subscribe({ next: (user) => { this.currentUser = user; this.originalEmail = user.email; this.profileForm.patchValue(user); this.loading = false; this.cdr.markForCheck(); }, error: (error) => { this.loading = false; this.toast.error(error, 'Unable to load profile.'); this.cdr.markForCheck(); } }); }
  enableEdit(): void { this.showEditForm = true; }
  cancelEdit(): void { this.showEditForm = false; this.profileForm.patchValue(this.currentUser || {} as User); }
  async onSave(): Promise<void> {
    const value = this.profileForm.getRawValue();
    const result=await this.confirmation.confirm({title:'Update profile?',message:'Save these changes to your profile?',confirmText:'Update profile'}); if(!result.confirmed)return;
    this.users.updateCurrentProfile({
      ...value,
    }).subscribe({ next: (user) => { this.currentUser = user; this.profileForm.patchValue(user); this.showEditForm = false; this.toast.success('Profile updated successfully.'); if (user.email !== this.originalEmail) { this.auth.logout(); void this.router.navigate(['/login']); } else { this.auth.saveEmail(user.email); } }, error: (error) => this.toast.error(error, 'Unable to update profile.') });
  }

  togglePasswordForm(): void { this.showPasswordForm = !this.showPasswordForm; if (!this.showPasswordForm) this.passwordForm.reset(); }

  async changePassword(): Promise<void> {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); this.toast.error(null, 'Complete all password fields.'); return; }
    const value = this.passwordForm.getRawValue();
    if (value.password !== value.confirmPassword) { this.passwordForm.controls.confirmPassword.setErrors({ mismatch: true }); this.toast.error(null, 'New passwords do not match.'); return; }
    if (!this.currentUser) return;
    const result = await this.confirmation.confirm({ title: 'Change password?', message: 'Update your account password?', confirmText: 'Change password' });
    if (!result.confirmed) return;
    this.users.updateCurrentProfile({ firstName: this.currentUser.firstName, lastName: this.currentUser.lastName, email: this.currentUser.email, phoneNumber: this.currentUser.phoneNumber, currentPassword: value.currentPassword, password: value.password }).subscribe({
      next: (user) => { this.currentUser = user; this.passwordForm.reset(); this.showPasswordForm = false; this.toast.success('Password updated successfully.'); },
      error: (error) => this.toast.error(error, 'Unable to update password.'),
    });
  }
}
