import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Role } from '../../../models/role';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss',
})
export class RoleListComponent {
  roles: Role[] = [];
  loading = false;
  errorMessage = '';
  readonly filterForm = new FormGroup({ search: new FormControl('', { nonNullable: true }) });
}
