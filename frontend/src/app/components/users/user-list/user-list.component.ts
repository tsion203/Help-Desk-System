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
import { ConfirmationService } from '../../../services/confirmation.service';

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
  constructor(private readonly userService: UserService, private readonly roleService: RoleService, private readonly authService: AuthService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef, private readonly confirmation: ConfirmationService) {}
  get canUpdate(): boolean { return this.authService.isAdmin(); }
  get canChangeStatus(): boolean { return this.authService.isAdmin(); }
  ngOnInit(): void {
    this.loadUsers();
    this.roleService.getAll().subscribe({ next: (items) => { this.roles = items; this.cdr.markForCheck(); }, error: (error) => this.toast.error(error, 'Unable to load roles.') });
    this.roleFilter.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => { this.page=0; this.loadUsers(); });
  }
  loadUsers(): void { this.loading = true; this.errorMessage = ''; this.userService.getPage(this.roleFilter.value || undefined,{page:this.page,size:this.pageSize}).subscribe({ next: (result) => { this.users=result.content; this.totalElements=result.totalElements; this.totalPages=result.totalPages; this.page=result.number; this.loading=false; this.cdr.markForCheck(); }, error: () => { this.errorMessage = 'Unable to load users.'; this.loading = false; this.cdr.markForCheck(); } }); }
  clearRoleFilter(): void { this.roleFilter.setValue(''); }
  changePage(page:number):void{this.page=page;this.loadUsers()}
  async changeStatus(user: User, event: Event): Promise<void> { event.stopPropagation(); const active=!user.active; const action=active?'Reactivate':'Deactivate'; const result=await this.confirmation.confirm({title:`${action} user?`,message:`${action} ${user.firstName} ${user.lastName}?`,confirmText:action,danger:!active}); if(!result.confirmed)return; this.userService.update(user.id,{employeeId:user.employeeId,firstName:user.firstName,lastName:user.lastName,email:user.email,phoneNumber:user.phoneNumber,active,departmentId:user.departmentId,roleIds:user.roles.map(role=>role.id)}).subscribe({next:()=>{this.loadUsers();this.toast.success(`User ${active?'reactivated':'deactivated'} successfully.`)},error:(error)=>this.toast.error(error,`Unable to ${action.toLowerCase()} user.`)}); }
}
