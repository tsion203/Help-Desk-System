import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { User } from '../../../models/user';
import { UserService } from '../../../services/user.service';
import { ToastService } from '../../../services/toast.service';
import { GlobalSearchService } from '../../../services/global-search.service';
import { GlobalSearchPipe } from '../../shared/global-search/global-search.pipe';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Role } from '../../../models/role';
import { RoleService } from '../../../services/role.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, GlobalSearchPipe, ReactiveFormsModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = false;
  errorMessage = '';
  readonly globalSearch = inject(GlobalSearchService);
  private readonly destroyRef = inject(DestroyRef);
  roles: Role[] = [];
  readonly roleFilter = new FormControl('', { nonNullable: true });
  constructor(private readonly userService: UserService, private readonly roleService: RoleService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void {
    this.loadUsers();
    this.roleService.getAll().subscribe({ next: (items) => { this.roles = items; this.cdr.markForCheck(); }, error: (error) => this.toast.error(error, 'Unable to load roles.') });
    this.roleFilter.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.loadUsers());
  }
  loadUsers(): void { this.loading = true; this.errorMessage = ''; this.userService.getAll(this.roleFilter.value || undefined).subscribe({ next: (items) => { this.users = items; this.loading = false; this.cdr.markForCheck(); }, error: () => { this.errorMessage = 'Unable to load users.'; this.loading = false; this.cdr.markForCheck(); } }); }
  clearRoleFilter(): void { this.roleFilter.setValue(''); }
  deleteUser(id: number, event: Event): void { event.stopPropagation(); this.userService.delete(id).subscribe({ next: () => { this.users = this.users.filter((item) => item.id !== id); this.toast.success('User deleted successfully.'); }, error: (error) => this.toast.error(error, 'Unable to delete user.') }); }
}
