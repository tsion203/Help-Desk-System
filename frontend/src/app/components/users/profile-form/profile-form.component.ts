import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
  private originalEmail = '';
  readonly profileForm = new FormGroup({
    firstName: new FormControl('', { nonNullable: true }), lastName: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true }), phoneNumber: new FormControl('', { nonNullable: true }),
    currentPassword: new FormControl('', { nonNullable: true }),
    password: new FormControl('', { nonNullable: true }),
  });
  constructor(private readonly users: UserService, private readonly auth: AuthService, private readonly toast: ToastService, private readonly router: Router, private readonly cdr: ChangeDetectorRef, private readonly confirmation: ConfirmationService) {}
  ngOnInit(): void { this.users.getCurrentProfile().subscribe({ next: (user) => { this.currentUser = user; this.originalEmail = user.email; this.profileForm.patchValue(user); this.loading = false; this.cdr.markForCheck(); }, error: (error) => { this.loading = false; this.toast.error(error, 'Unable to load profile.'); this.cdr.markForCheck(); } }); }
  enableEdit(): void { this.showEditForm = true; }
  cancelEdit(): void { this.showEditForm = false; this.profileForm.patchValue(this.currentUser || {} as User); }
  async onSave(): Promise<void> {
    const value = this.profileForm.getRawValue();
    if (value.password && !value.currentPassword) {
      this.toast.error(null, 'Enter your current password before choosing a new password.');
      return;
    }
    const result=await this.confirmation.confirm({title:'Update profile?',message:'Save these changes to your profile?',confirmText:'Update profile'}); if(!result.confirmed)return;
    this.users.updateCurrentProfile({
      ...value,
      currentPassword: value.password ? value.currentPassword : undefined,
      password: value.password || undefined,
    }).subscribe({ next: (user) => { this.currentUser = user; this.profileForm.patchValue({ ...user, currentPassword: '', password: '' }); this.showEditForm = false; this.toast.success('Profile updated successfully.'); if (user.email !== this.originalEmail) { this.auth.logout(); void this.router.navigate(['/login']); } else { this.auth.saveEmail(user.email); } }, error: (error) => this.toast.error(error, 'Unable to update profile.') });
  }
}
