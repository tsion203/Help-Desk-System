import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DepartmentRequest } from '../../../models/department';
import { Department } from '../../../models/department';
import { DepartmentService } from '../../../services/department.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './department-form.component.html',
  styleUrl: './department-form.component.scss',
})
export class DepartmentFormComponent {
  readonly departmentForm = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
  });

  departmentRequest: DepartmentRequest | null = null;
  savedDepartment: Department | null = null;
  errorMessage = '';

  constructor(private readonly departmentService: DepartmentService, private readonly toast: ToastService) {}

  onSave(): void {
    this.departmentRequest = this.departmentForm.getRawValue();
    this.departmentService.create(this.departmentRequest).subscribe({
      next: (department) => { this.savedDepartment = department; this.departmentForm.reset({ name: '', description: '' }); this.toast.success('Department created successfully.'); },
      error: (error) => this.toast.error(error, 'Unable to save department.'),
    });
  }
}
