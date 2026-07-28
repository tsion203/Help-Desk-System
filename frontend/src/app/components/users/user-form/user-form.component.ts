import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserRequest } from '../../../models/user';
import { Department } from '../../../models/department';
import { Role } from '../../../models/role';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent {
  departments: Department[] = [];
  roles: Role[] = [];
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
  }
}
