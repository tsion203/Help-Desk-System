import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserRequest } from '../../../models/user';
import { Department } from '../../../models/department';
import { Role } from '../../../models/role';
import { UserService } from '../../../services/user.service';
import { DepartmentService } from '../../../services/department.service';
import { RoleService } from '../../../services/role.service';
import { ActivatedRoute } from '@angular/router';

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
    email: new FormControl('', { nonNullable: true }),
    employeeId: new FormControl('', { nonNullable: true }),
    firstName: new FormControl('', { nonNullable: true }),
    lastName: new FormControl('', { nonNullable: true }),
    phoneNumber: new FormControl('', { nonNullable: true }),
    active: new FormControl(true, { nonNullable: true }),
    departmentId: new FormControl(0, { nonNullable: true }),
    roleIds: new FormControl<number[]>([], { nonNullable: true }),
  });

  userRequest: UserRequest | null = null;

  onSave(): void {
    const value = this.userForm.getRawValue();
    this.userRequest = {
      ...value,
      departmentId: Number(value.departmentId),
      roleIds: value.roleIds.map(Number),
    };
    const request = this.userId
      ? this.userService.update(this.userId, this.userRequest)
      : this.userService.create(this.userRequest);
    request.subscribe({
      next: (user) => {
        this.userId = user.id;
        this.errorMessage = '';
      },
      error: () => (this.errorMessage = 'Unable to save user.'),
    });
  }
}
