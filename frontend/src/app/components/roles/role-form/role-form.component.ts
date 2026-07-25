import { Component } from '@angular/core';
import { RoleService } from '../../../services/role.service';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [],
  templateUrl: './role-form.component.html',
})
export class RoleFormComponent {
  constructor(private readonly roleService: RoleService) {}
}
