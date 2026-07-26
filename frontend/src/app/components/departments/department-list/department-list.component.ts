import { Component } from '@angular/core';
import { DepartmentService } from '../../../services/department.service';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [],
  templateUrl: './department-list.component.html',
  styleUrl: './department-list.component.scss',
})
export class DepartmentListComponent {
  constructor(private readonly departmentService: DepartmentService) {}
}
