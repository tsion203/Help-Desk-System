import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Department } from '../../../models/department';
import { DepartmentService } from '../../../services/department.service';
import { ToastService } from '../../../services/toast.service';
import { RouterLink } from '@angular/router';
import { GlobalSearchService } from '../../../services/global-search.service';
import { GlobalSearchPipe } from '../../shared/global-search/global-search.pipe';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, RouterLink, GlobalSearchPipe, PaginationComponent],
  templateUrl: './department-list.component.html',
  styleUrl: './department-list.component.scss',
})
export class DepartmentListComponent implements OnInit {
  departments: Department[] = [];
  loading = false;
  errorMessage = '';
  readonly globalSearch = inject(GlobalSearchService);
  page=0;readonly pageSize=5;totalElements=0;totalPages=0;
  constructor(private readonly departmentService: DepartmentService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.loadPage(); }
  loadPage():void{this.loading=true;this.departmentService.getPage({page:this.page,size:this.pageSize}).subscribe({next:(r)=>{this.departments=r.content;this.totalElements=r.totalElements;this.totalPages=r.totalPages;this.page=r.number;this.loading=false;this.cdr.markForCheck()},error:()=>{this.errorMessage='Unable to load departments.';this.loading=false;this.cdr.markForCheck()}})}
  changePage(p:number):void{this.page=p;this.loadPage()}
  deleteDepartment(id: number, event: Event): void { event.stopPropagation(); this.departmentService.delete(id).subscribe({ next: () => {if(this.departments.length===1&&this.page>0)this.page--;this.loadPage();this.toast.success('Department deleted successfully.'); }, error: (error) => this.toast.error(error, 'Unable to delete department.') }); }
}
