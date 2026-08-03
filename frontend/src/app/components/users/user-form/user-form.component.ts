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
  errorMessage = '';

  constructor(
    private readonly userService: UserService,
    private readonly departmentService: DepartmentService,
    private readonly roleService: RoleService,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.departmentService.getAll().subscribe({ next: (items) => { this.departments = items; this.cdr.markForCheck(); }, error: () => { this.errorMessage = 'Unable to load departments.'; this.cdr.markForCheck(); } });
    this.roleService.getAll().subscribe({ next: (items) => { this.roles = items; this.cdr.markForCheck(); }, error: () => { this.errorMessage = 'Unable to load roles.'; this.cdr.markForCheck(); } });
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.userId = id;
      this.userService.getById(id).subscribe({
        next: (user) => { this.userForm.patchValue({ ...user, roleIds: user.roles.map((role) => role.id) }); this.cdr.markForCheck(); },
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
    roleIds: new FormControl<number[]>([], { nonNullable: true }),
  });

  userRequest: UserRequest | null = null;

  onSave(): void {
    if (!this.userId && this.userForm.controls.temporaryPassword.value.length < 8) {
      this.userForm.markAllAsTouched();
      this.toast.error(null, 'Please fill in all required fields.');
      return;
    }
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.toast.error(null, 'Please fill in all required fields.');
      return;
    }
    const value = this.userForm.getRawValue();
    const selectedRoleIds = Array.isArray(value.roleIds)
      ? value.roleIds
      : value.roleIds
        ? [value.roleIds]
        : [];
    if (selectedRoleIds.length === 0 || selectedRoleIds.some((id) => Number(id) < 1)) {
      this.toast.error(null, 'Please fill in all required fields.');
      return;
    }
    this.userRequest = {
      ...value,
      departmentId: Number(value.departmentId),
      roleIds: selectedRoleIds.map(Number),
      temporaryPassword: this.userId ? undefined : value.temporaryPassword,
    };
    const request = this.userId
      ? this.userService.update(this.userId, this.userRequest)
      : this.userService.create(this.userRequest);
    request.subscribe({
      next: (user) => {
        this.errorMessage = '';
        this.toast.success(this.userId ? 'User updated successfully.' : 'User created successfully.');
        if (this.userId) this.userId = user.id;
        else this.userForm.reset({ email: '', employeeId: '', temporaryPassword: '', firstName: '', lastName: '', phoneNumber: '', active: true, departmentId: 0, roleIds: [] });
      },
      error: (error) => this.toast.error(error, 'Unable to save user.'),
    });
  }

  get pageTitle(): string { return this.userId ? 'Edit user' : 'Create user'; }
}
