import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Department } from '../../../models/department';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './department-list.component.html',
  styleUrl: './department-list.component.scss',
})
export class DepartmentListComponent {
  departments: Department[] = [];
  loading = false;
  errorMessage = '';
  readonly filterForm = new FormGroup({ search: new FormControl('', { nonNullable: true }), status: new FormControl('all', { nonNullable: true }) });
}
