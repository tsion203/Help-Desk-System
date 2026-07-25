import { Component } from '@angular/core';
import { DepartmentService } from '../../../services/department.service';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [],
  templateUrl: './department-list.component.html',
})
export class DepartmentListComponent {
  constructor(private readonly departmentService: DepartmentService) {}
}
