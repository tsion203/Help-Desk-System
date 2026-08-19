import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserRequest } from '../../../models/user';
import { Department } from '../../../models/department';
import { Role } from '../../../models/role';
import { UserService } from '../../../services/user.service';
import { DepartmentService } from '../../../services/department.service';
import { RoleService } from '../../../services/role.service';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { ConfirmationService } from '../../../services/confirmation.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent implements OnInit {
  departments: Department[] = [];
  roles: Role[] = [];
  userId: number | null = null;
  currentRoleId = 0;
  errorMessage = '';

  constructor(
    private readonly userService: UserService,
    private readonly departmentService: DepartmentService,
    private readonly roleService: RoleService,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
    private readonly toast: ToastService,
    private readonly confirmation: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.departmentService.getAll().subscribe({ next: (items) => { this.departments = items; this.cdr.markForCheck(); }, error: () => { this.errorMessage = 'Unable to load departments.'; this.cdr.markForCheck(); } });
    this.roleService.getAll().subscribe({ next: (items) => { this.roles = items; this.cdr.markForCheck(); }, error: () => { this.errorMessage = 'Unable to load roles.'; this.cdr.markForCheck(); } });
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.userId = id;
      this.userService.getById(id).subscribe({
        next: (user) => { this.currentRoleId = user.roles[0]?.id ?? 0; this.userForm.patchValue({ ...user, roleIds: this.currentRoleId }); this.cdr.markForCheck(); },
        error: () => { this.errorMessage = 'Unable to load user.'; this.cdr.markForCheck(); },
      });
    }
  }
  readonly userForm = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    employeeId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    temporaryPassword: new FormControl('', { nonNullable: true }),
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    phoneNumber: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    active: new FormControl(true, { nonNullable: true }),
    departmentId: new FormControl(0, { nonNullable: true, validators: [Validators.min(1)] }),
    roleIds: new FormControl(0, { nonNullable: true, validators: [Validators.min(1)] }),
  });

  userRequest: UserRequest | null = null;

  async onSave(): Promise<void> {
    if (!this.userId && this.userForm.controls.temporaryPassword.value.length < 8) {
      this.userForm.markAllAsTouched();
      this.toast.error(null, 'Temporary password must be at least 8 characters.');
      return;
    }
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.toast.error(null, 'Please fill in all required fields.');
      return;
    }
    const value = this.userForm.getRawValue();
    const selectedRoleIds = [Number(value.roleIds)];
    this.userRequest = {
      ...value,
      departmentId: Number(value.departmentId),
      roleIds: selectedRoleIds.map(Number),
      temporaryPassword: this.userId ? undefined : value.temporaryPassword,
    };
    if (this.userId && this.currentRoleId !== Number(value.roleIds)) { const currentRole=this.roles.find(role=>role.id===this.currentRoleId)?.name ?? 'Unknown'; const newRole=this.roles.find(role=>role.id===Number(value.roleIds))?.name ?? 'Unknown'; const result=await this.confirmation.confirm({title:'Change user role?',message:`Change this user's role from ${currentRole} to ${newRole}?`,confirmText:'Change role'}); if(!result.confirmed)return; }
    const request = this.userId
      ? this.userService.update(this.userId, this.userRequest)
      : this.userService.create(this.userRequest);
    request.subscribe({
      next: (user) => {
        this.errorMessage = '';
        this.toast.success(this.userId ? 'User updated successfully.' : 'User created successfully.');
        if (this.userId) { this.userId = user.id; this.currentRoleId = user.roles[0]?.id ?? this.currentRoleId; }
        else this.userForm.reset({ email: '', employeeId: '', temporaryPassword: '', firstName: '', lastName: '', phoneNumber: '', active: true, departmentId: 0, roleIds: 0 });
      },
      error: (error) => this.toast.error(error, 'Unable to save user.'),
    });
  }

  get pageTitle(): string { return this.userId ? 'Edit user' : 'Create user'; }
}
