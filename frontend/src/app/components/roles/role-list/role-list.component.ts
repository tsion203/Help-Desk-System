import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Role } from '../../../models/role';
import { RoleService } from '../../../services/role.service';
import { ToastService } from '../../../services/toast.service';
import { RouterLink } from '@angular/router';
import { GlobalSearchService } from '../../../services/global-search.service';
import { GlobalSearchPipe } from '../../shared/global-search/global-search.pipe';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { AuthService } from '../../../services/auth.service';
import { ConfirmationService } from '../../../services/confirmation.service';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, RouterLink, GlobalSearchPipe, PaginationComponent],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss',
})
export class RoleListComponent implements OnInit {
  roles: Role[] = [];
  loading = false;
  errorMessage = '';
  readonly globalSearch = inject(GlobalSearchService);
  page=0;readonly pageSize=5;totalElements=0;totalPages=0;
  constructor(private readonly roleService: RoleService, private readonly authService: AuthService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef, private readonly confirmation: ConfirmationService) {}
  get canUpdate(): boolean { return this.authService.isAdmin(); }
  get canChangeStatus(): boolean { return this.authService.isAdmin(); }
  ngOnInit(): void { this.loadPage(); }
  loadPage():void{this.loading=true;this.roleService.getPage({page:this.page,size:this.pageSize}).subscribe({next:(r)=>{this.roles=r.content;this.totalElements=r.totalElements;this.totalPages=r.totalPages;this.page=r.number;this.loading=false;this.cdr.markForCheck()},error:()=>{this.errorMessage='Unable to load roles.';this.loading=false;this.cdr.markForCheck()}})}
  changePage(p:number):void{this.page=p;this.loadPage()}
  async changeStatus(role: Role, event: Event): Promise<void> { event.stopPropagation(); const active=!role.active; const action=active?'Reactivate':'Deactivate'; const result=await this.confirmation.confirm({title:`${action} role?`,message:`${action} ${role.name}?`,confirmText:action,danger:!active}); if(!result.confirmed)return; this.roleService.setActive(role.id,active).subscribe({next:()=>{this.loadPage();this.toast.success(`Role ${active?'reactivated':'deactivated'} successfully.`)},error:(error)=>this.toast.error(error,`Unable to ${action.toLowerCase()} role.`)}); }
}
