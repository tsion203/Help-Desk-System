import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Ticket } from '../../../models/ticket';
import { TicketService } from '../../../services/ticket.service';
import { TicketCategory } from '../../../models/ticket-category';
import { TicketCategoryService } from '../../../services/ticket-category.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { GlobalSearchService } from '../../../services/global-search.service';
import { GlobalSearchPipe } from '../../shared/global-search/global-search.pipe';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { ConfirmationService } from '../../../services/confirmation.service';
import { ticketPriorityBadge, ticketStatusBadge } from '../ticket-badge.util';

@Component({
  selector: 'app-created-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterLink, GlobalSearchPipe, ReactiveFormsModule, PaginationComponent],
  templateUrl: './created-ticket-list.component.html',
  styleUrls: ['../ticket-list/ticket-list.component.scss'],
})
export class CreatedTicketListComponent implements OnInit {
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
  page = 0;
  readonly pageSize = 5;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private readonly ticketService: TicketService,
    private readonly categoryService: TicketCategoryService,
    private readonly authService: AuthService,
    private readonly toast: ToastService,
    private readonly cdr: ChangeDetectorRef,
    private readonly confirmation: ConfirmationService,
  ) {}

  get canCreate(): boolean { return this.authService.isEmployee() && !this.authService.isAdmin(); }
  get canUpdate(): boolean { return this.authService.isEmployee(); }
  get canDelete(): boolean { return this.authService.isAdmin() || this.authService.isEmployee(); }
  statusBadge(status:string):string{return ticketStatusBadge(status)}
  priorityBadge(priority:string):string{return ticketPriorityBadge(priority)}

  ngOnInit(): void {
    this.loadTickets();
    this.categoryService.getAll().subscribe({
      next: (items) => { this.categories = items; this.cdr.markForCheck(); },
      error: (error) => this.toast.error(error, 'Unable to load ticket categories.'),
    });
    this.filterForm.valueChanges.subscribe(() => { this.page = 0; this.loadTickets(); });
  }

  loadTickets(): void {
    this.loading = true;
    this.errorMessage = '';
    const filters = this.filterForm.getRawValue();
    this.ticketService.getCreatedTickets({ status: filters.status || undefined, category: filters.category || undefined, priority: filters.priority || undefined }, { page: this.page, size: this.pageSize })
      .subscribe({
        next: (result) => {
          this.tickets = result.content;
          this.totalElements = result.totalElements;
          this.totalPages = result.totalPages;
          this.page = result.number;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMessage = 'Unable to load created tickets.';
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  clearFilters(): void { this.filterForm.reset({ status: '', category: '', priority: '' }); }

  changePage(page: number): void { this.page = page; this.loadTickets(); }

  async deleteTicket(id: number, event: Event): Promise<void> {
    event.stopPropagation();
    const ticket=this.tickets.find(item=>item.id===id); const result=await this.confirmation.confirm({title:'Delete ticket?',message:`Delete ${ticket?.ticketNumber || `ticket #${id}`}? This action cannot be undone.`,confirmText:'Delete ticket',danger:true}); if(!result.confirmed)return;
    this.ticketService.delete(id).subscribe({
      next: () => {
        if (this.tickets.length === 1 && this.page > 0) this.page--;
        this.loadTickets();
        this.toast.success('Ticket deleted successfully.');
      },
      error: (error) => this.toast.error(error, 'Unable to delete ticket.'),
    });
  }
}
