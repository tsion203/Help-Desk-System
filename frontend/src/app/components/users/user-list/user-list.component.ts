import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { User } from '../../../models/user';
import { UserService } from '../../../services/user.service';
import { ToastService } from '../../../services/toast.service';
import { GlobalSearchService } from '../../../services/global-search.service';
import { AuthService } from '../../../services/auth.service';
import { GlobalSearchPipe } from '../../shared/global-search/global-search.pipe';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Role } from '../../../models/role';
import { RoleService } from '../../../services/role.service';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, GlobalSearchPipe, ReactiveFormsModule, PaginationComponent],
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
  page=0; readonly pageSize=5; totalElements=0; totalPages=0;
  constructor(private readonly userService: UserService, private readonly roleService: RoleService, private readonly authService: AuthService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef) {}
  get canUpdate(): boolean { return this.authService.isAdmin(); }
  get canDelete(): boolean { return this.authService.isAdmin(); }
  ngOnInit(): void {
    this.loadUsers();
    this.roleService.getAll().subscribe({ next: (items) => { this.roles = items; this.cdr.markForCheck(); }, error: (error) => this.toast.error(error, 'Unable to load roles.') });
    this.roleFilter.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => { this.page=0; this.loadUsers(); });
  }
  loadUsers(): void { this.loading = true; this.errorMessage = ''; this.userService.getPage(this.roleFilter.value || undefined,{page:this.page,size:this.pageSize}).subscribe({ next: (result) => { this.users=result.content; this.totalElements=result.totalElements; this.totalPages=result.totalPages; this.page=result.number; this.loading=false; this.cdr.markForCheck(); }, error: () => { this.errorMessage = 'Unable to load users.'; this.loading = false; this.cdr.markForCheck(); } }); }
  clearRoleFilter(): void { this.roleFilter.setValue(''); }
  changePage(page:number):void{this.page=page;this.loadUsers()}
  deleteUser(id: number, event: Event): void { event.stopPropagation(); this.userService.delete(id).subscribe({ next: () => { if(this.users.length===1&&this.page>0)this.page--; this.loadUsers(); this.toast.success('User deleted successfully.'); }, error: (error) => this.toast.error(error, 'Unable to delete user.') }); }
}
