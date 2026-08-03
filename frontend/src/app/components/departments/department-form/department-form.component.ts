import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DepartmentRequest } from '../../../models/department';
import { Department } from '../../../models/department';
import { DepartmentService } from '../../../services/department.service';
import { ToastService } from '../../../services/toast.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './department-form.component.html',
  styleUrl: './department-form.component.scss',
})
export class DepartmentFormComponent implements OnInit {
  readonly departmentForm = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
  });

  departmentRequest: DepartmentRequest | null = null;
  savedDepartment: Department | null = null;
  errorMessage = '';
  departmentId: number | null = null;

  constructor(private readonly departmentService: DepartmentService, private readonly toast: ToastService, private readonly route: ActivatedRoute) {}

  ngOnInit(): void { const id = Number(this.route.snapshot.paramMap.get('id')); if (id) { this.departmentId = id; this.departmentService.getById(id).subscribe({ next: (department) => this.departmentForm.patchValue(department), error: (error) => this.toast.error(error, 'Unable to load department.') }); } }

  onSave(): void {
    this.departmentRequest = this.departmentForm.getRawValue();
    const request = this.departmentId ? this.departmentService.update(this.departmentId, this.departmentRequest) : this.departmentService.create(this.departmentRequest);
    request.subscribe({
      next: (department) => { this.savedDepartment = department; if (!this.departmentId) this.departmentForm.reset({ name: '', description: '' }); this.toast.success(this.departmentId ? 'Department updated successfully.' : 'Department created successfully.'); },
      error: (error) => this.toast.error(error, 'Unable to save department.'),
    });
  }
  get pageTitle(): string { return this.departmentId ? 'Edit department' : 'New department'; }
}
