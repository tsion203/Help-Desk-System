import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RoleRequest } from '../../../models/role';
import { Role } from '../../../models/role';
import { RoleService } from '../../../services/role.service';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './role-form.component.html',
  styleUrl: './role-form.component.scss',
})
export class RoleFormComponent {
  readonly roleForm = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
  });

  roleRequest: RoleRequest | null = null;
  savedRole: Role | null = null;
  errorMessage = '';

  constructor(private readonly roleService: RoleService) {}

  onSave(): void {
    this.roleRequest = this.roleForm.getRawValue();
    this.roleService.create(this.roleRequest).subscribe({
      next: (role) => (this.savedRole = role),
      error: () => (this.errorMessage = 'Unable to save role.'),
    });
  }
}
