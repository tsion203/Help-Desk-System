import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TicketCategory } from '../../../models/ticket-category';
import { TicketCategoryService } from '../../../services/ticket-category.service';
import { ToastService } from '../../../services/toast.service';
import { GlobalSearchService } from '../../../services/global-search.service';
import { GlobalSearchPipe } from '../../shared/global-search/global-search.pipe';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { AuthService } from '../../../services/auth.service';
import { ConfirmationService } from '../../../services/confirmation.service';

@Component({ selector: 'app-category-list', standalone: true, imports: [CommonModule, RouterLink, GlobalSearchPipe, PaginationComponent], templateUrl: './category-list.component.html' })
export class CategoryListComponent implements OnInit {
  categories: TicketCategory[] = []; loading = true;
  readonly globalSearch = inject(GlobalSearchService);
  page=0;readonly pageSize=5;totalElements=0;totalPages=0;
  constructor(private readonly categoriesService: TicketCategoryService, private readonly authService: AuthService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef, private readonly confirmation: ConfirmationService) {}
  get canUpdate(): boolean { return this.authService.isAdmin(); }
  get canChangeStatus(): boolean { return this.authService.isAdmin(); }
  ngOnInit(): void { this.loadPage(); }
  loadPage():void{this.loading=true;this.categoriesService.getPage({page:this.page,size:this.pageSize}).subscribe({next:(r)=>{this.categories=r.content;this.totalElements=r.totalElements;this.totalPages=r.totalPages;this.page=r.number;this.loading=false;this.cdr.markForCheck()},error:(e)=>{this.loading=false;this.toast.error(e,'Unable to load categories.');this.cdr.markForCheck()}})}
  changePage(p:number):void{this.page=p;this.loadPage()}
  async changeStatus(category: TicketCategory, event: Event): Promise<void> { event.stopPropagation(); const active=!category.active; const action=active?'Reactivate':'Deactivate'; const result=await this.confirmation.confirm({title:`${action} category?`,message:`${action} ${category.name}?`,confirmText:action,danger:!active}); if(!result.confirmed)return; this.categoriesService.setActive(category.id,active).subscribe({next:()=>{this.loadPage();this.toast.success(`Category ${active?'reactivated':'deactivated'} successfully.`)},error:(error)=>this.toast.error(error,`Unable to ${action.toLowerCase()} category.`)}); }
}
