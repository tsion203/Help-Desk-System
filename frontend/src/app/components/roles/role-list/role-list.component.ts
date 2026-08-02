import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Role } from '../../../models/role';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RoleService } from '../../../services/role.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss',
})
export class RoleListComponent implements OnInit {
  roles: Role[] = [];
  loading = false;
  errorMessage = '';
  readonly filterForm = new FormGroup({ search: new FormControl('', { nonNullable: true }) });
  constructor(private readonly roleService: RoleService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.loading = true; this.roleService.getAll().subscribe({ next: (items) => { this.roles = items; this.loading = false; this.cdr.markForCheck(); }, error: () => { this.errorMessage = 'Unable to load roles.'; this.loading = false; this.cdr.markForCheck(); } }); }
  deleteRole(id: number): void { this.roleService.delete(id).subscribe({ next: () => { this.roles = this.roles.filter((item) => item.id !== id); this.toast.success('Role deleted successfully.'); }, error: (error) => this.toast.error(error, 'Unable to delete role.') }); }
}
