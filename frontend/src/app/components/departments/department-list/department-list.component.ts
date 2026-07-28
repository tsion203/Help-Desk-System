import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Department } from '../../../models/department';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DepartmentService } from '../../../services/department.service';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './department-list.component.html',
  styleUrl: './department-list.component.scss',
})
export class DepartmentListComponent implements OnInit {
  departments: Department[] = [];
  loading = false;
  errorMessage = '';
  readonly filterForm = new FormGroup({ search: new FormControl('', { nonNullable: true }), status: new FormControl('all', { nonNullable: true }) });
  constructor(private readonly departmentService: DepartmentService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.loading = true; this.departmentService.getAll().subscribe({ next: (items) => { this.departments = items; this.loading = false; this.cdr.markForCheck(); }, error: () => { this.errorMessage = 'Unable to load departments.'; this.loading = false; this.cdr.markForCheck(); } }); }
  deleteDepartment(id: number): void { this.departmentService.delete(id).subscribe({ next: () => (this.departments = this.departments.filter((item) => item.id !== id)), error: () => (this.errorMessage = 'Unable to delete department.') }); }
}
