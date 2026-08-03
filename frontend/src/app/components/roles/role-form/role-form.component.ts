import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoleRequest } from '../../../models/role';
import { Role } from '../../../models/role';
import { RoleService } from '../../../services/role.service';
import { ToastService } from '../../../services/toast.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './role-form.component.html',
  styleUrl: './role-form.component.scss',
})
export class RoleFormComponent implements OnInit {
  readonly roleForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  roleRequest: RoleRequest | null = null;
  savedRole: Role | null = null;
  errorMessage = '';
  roleId: number | null = null;

  constructor(private readonly roleService: RoleService, private readonly toast: ToastService, private readonly route: ActivatedRoute) {}

  ngOnInit(): void { const id = Number(this.route.snapshot.paramMap.get('id')); if (id) { this.roleId = id; this.roleService.getById(id).subscribe({ next: (role) => this.roleForm.patchValue(role), error: (error) => this.toast.error(error, 'Unable to load role.') }); } }

  onSave(): void {
    if (this.roleForm.invalid) { this.roleForm.markAllAsTouched(); this.toast.error(null, 'Please fill in all required fields.'); return; }
    this.roleRequest = this.roleForm.getRawValue();
    const request = this.roleId ? this.roleService.update(this.roleId, this.roleRequest) : this.roleService.create(this.roleRequest);
    request.subscribe({
      next: (role) => { this.savedRole = role; if (!this.roleId) this.roleForm.reset({ name: '', description: '' }); this.toast.success(this.roleId ? 'Role updated successfully.' : 'Role created successfully.'); },
      error: (error) => this.toast.error(error, 'Unable to save role.'),
    });
  }
  get pageTitle(): string { return this.roleId ? 'Edit role' : 'New role'; }
}
