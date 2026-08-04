import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Department } from '../../../models/department';
import { DepartmentService } from '../../../services/department.service';
import { ToastService } from '../../../services/toast.service';
import { RouterLink } from '@angular/router';
import { GlobalSearchService } from '../../../services/global-search.service';
import { GlobalSearchPipe } from '../../shared/global-search/global-search.pipe';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, RouterLink, GlobalSearchPipe],
  templateUrl: './department-list.component.html',
  styleUrl: './department-list.component.scss',
})
export class DepartmentListComponent implements OnInit {
  departments: Department[] = [];
  loading = false;
  errorMessage = '';
  readonly globalSearch = inject(GlobalSearchService);
  constructor(private readonly departmentService: DepartmentService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.loading = true; this.departmentService.getAll().subscribe({ next: (items) => { this.departments = items; this.loading = false; this.cdr.markForCheck(); }, error: () => { this.errorMessage = 'Unable to load departments.'; this.loading = false; this.cdr.markForCheck(); } }); }
  deleteDepartment(id: number, event: Event): void { event.stopPropagation(); this.departmentService.delete(id).subscribe({ next: () => { this.departments = this.departments.filter((item) => item.id !== id); this.toast.success('Department deleted successfully.'); }, error: (error) => this.toast.error(error, 'Unable to delete department.') }); }
}
