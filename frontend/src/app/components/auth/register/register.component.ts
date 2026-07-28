import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RegisterRequest } from '../../../models/auth-request';
import { Department } from '../../../models/department';
import { Role } from '../../../models/role';
import { LoginResponse } from '../../../models/auth-response';
import { AuthService } from '../../../services/auth.service';
import { DepartmentService } from '../../../services/department.service';
import { RoleService } from '../../../services/role.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
  departments: Department[] = [];
  roles: Role[] = [];
  errorMessage = '';
  registerResponse: LoginResponse | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly departmentService: DepartmentService,
    private readonly roleService: RoleService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.departmentService.getAll().subscribe({
      next: (departments) => { this.departments = departments; this.cdr.markForCheck(); },
      error: () => { this.errorMessage = 'Unable to load departments.'; this.cdr.markForCheck(); },
    });
    this.roleService.getAll().subscribe({
      next: (roles) => { this.roles = roles; this.cdr.markForCheck(); },
      error: () => { this.errorMessage = 'Unable to load roles.'; this.cdr.markForCheck(); },
    });
  }
  readonly registerForm = new FormGroup({
    email: new FormControl('', { nonNullable: true }),
    password: new FormControl('', { nonNullable: true }),
    employeeId: new FormControl('', { nonNullable: true }),
    firstName: new FormControl('', { nonNullable: true }),
    lastName: new FormControl('', { nonNullable: true }),
    phoneNumber: new FormControl('', { nonNullable: true }),
    active: new FormControl(true, { nonNullable: true }),
    departmentId: new FormControl(0, { nonNullable: true }),
    roleIds: new FormControl<number[]>([], { nonNullable: true }),
  });

  registerRequest: RegisterRequest | null = null;

  onRegister(): void {
    const value = this.registerForm.getRawValue();
    this.registerRequest = {
      ...value,
      departmentId: Number(value.departmentId),
      roleIds: value.roleIds.map(Number),
    };
    this.errorMessage = '';
    this.authService.register(this.registerRequest).subscribe({
      next: (response) => (this.registerResponse = response),
      error: () => (this.errorMessage = 'Unable to register.'),
    });
  }
}
