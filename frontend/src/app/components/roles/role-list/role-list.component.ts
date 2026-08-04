import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Role } from '../../../models/role';
import { RoleService } from '../../../services/role.service';
import { ToastService } from '../../../services/toast.service';
import { RouterLink } from '@angular/router';
import { GlobalSearchService } from '../../../services/global-search.service';
import { GlobalSearchPipe } from '../../shared/global-search/global-search.pipe';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, RouterLink, GlobalSearchPipe],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss',
})
export class RoleListComponent implements OnInit {
  roles: Role[] = [];
  loading = false;
  errorMessage = '';
  readonly globalSearch = inject(GlobalSearchService);
  constructor(private readonly roleService: RoleService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.loading = true; this.roleService.getAll().subscribe({ next: (items) => { this.roles = items; this.loading = false; this.cdr.markForCheck(); }, error: () => { this.errorMessage = 'Unable to load roles.'; this.loading = false; this.cdr.markForCheck(); } }); }
  deleteRole(id: number, event: Event): void { event.stopPropagation(); this.roleService.delete(id).subscribe({ next: () => { this.roles = this.roles.filter((item) => item.id !== id); this.toast.success('Role deleted successfully.'); }, error: (error) => this.toast.error(error, 'Unable to delete role.') }); }
}
