import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Ticket } from '../../../models/ticket';
import { TicketService } from '../../../services/ticket.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { GlobalSearchService } from '../../../services/global-search.service';
import { GlobalSearchPipe } from '../../shared/global-search/global-search.pipe';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TicketCategory } from '../../../models/ticket-category';
import { TicketCategoryService } from '../../../services/ticket-category.service';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterLink, GlobalSearchPipe, ReactiveFormsModule, PaginationComponent],
  templateUrl: './ticket-list.component.html',
  styleUrl: './ticket-list.component.scss',
})
export class TicketListComponent implements OnInit {
  tickets: Ticket[] = [];
  loading = false;
  errorMessage = '';
  readonly globalSearch = inject(GlobalSearchService);
  private readonly destroyRef = inject(DestroyRef);
  categories: TicketCategory[] = [];
  readonly filterForm = new FormGroup({
    status: new FormControl('', { nonNullable: true }),
    category: new FormControl('', { nonNullable: true }),
    priority: new FormControl('', { nonNullable: true }),
  });
  readonly statuses = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED', 'REOPENED'];
  readonly priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  page=0; readonly pageSize=5; totalElements=0; totalPages=0;
  constructor(private readonly ticketService: TicketService, private readonly categoryService: TicketCategoryService, private readonly authService: AuthService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef, private readonly router: Router) {}
  get canCreate(): boolean { return this.authService.isAdmin() || this.authService.isEmployee(); }
  get canUpdate(): boolean { return true; }
  get canDelete(): boolean { return this.authService.isAdmin() || this.authService.isEmployee(); }
  ngOnInit(): void {
    this.loadTickets();
    this.categoryService.getAll().subscribe({ next: (items) => { this.categories = items; this.cdr.markForCheck(); }, error: (error) => this.toast.error(error, 'Unable to load ticket categories.') });
    this.filterForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => { this.page=0; this.loadTickets(); });
  }
  loadTickets(): void {
    this.loading = true; this.errorMessage = '';
    const filters = this.filterForm.getRawValue();
    this.ticketService.getPage({ status: filters.status || undefined, category: filters.category || undefined, priority: filters.priority || undefined },{page:this.page,size:this.pageSize}).subscribe({ next: (result) => { this.tickets=result.content; this.totalElements=result.totalElements; this.totalPages=result.totalPages; this.page=result.number; this.loading=false; this.cdr.markForCheck(); }, error: () => { this.errorMessage = 'Unable to load tickets.'; this.loading = false; this.cdr.markForCheck(); } });
  }
  clearFilters(): void { this.filterForm.reset({ status: '', category: '', priority: '' }); }
  changePage(page:number):void { this.page=page; this.loadTickets(); }
  editTicket(id: number, event: Event): void { event.stopPropagation(); void this.router.navigate(['/tickets', id, 'edit']); }
  deleteTicket(id: number, event: Event): void { event.stopPropagation(); this.ticketService.delete(id).subscribe({ next: () => { if(this.tickets.length===1&&this.page>0)this.page--; this.loadTickets(); this.toast.success('Ticket deleted successfully.'); }, error: (error) => this.toast.error(error, 'Unable to delete ticket.') }); }
}
