import { Component } from '@angular/core';
import { DepartmentService } from '../../../services/department.service';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [],
  templateUrl: './department-form.component.html',
})
export class DepartmentFormComponent {
  constructor(private readonly departmentService: DepartmentService) {}
}
