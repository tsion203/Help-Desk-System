import { Component } from '@angular/core';
import { RoleService } from '../../../services/role.service';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss',
})
export class RoleListComponent {
  constructor(private readonly roleService: RoleService) {}
}
