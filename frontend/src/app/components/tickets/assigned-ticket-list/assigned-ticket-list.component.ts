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

@Component({
  selector: 'app-assigned-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterLink, GlobalSearchPipe, ReactiveFormsModule, PaginationComponent],
  templateUrl: './assigned-ticket-list.component.html',
  styleUrls: ['../ticket-list/ticket-list.component.scss'],
})
export class AssignedTicketListComponent implements OnInit {
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

  get canUpdate(): boolean { return this.authService.isEmployee(); }

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
    this.ticketService.getAssignedTickets({ status: filters.status || undefined, category: filters.category || undefined, priority: filters.priority || undefined }, { page: this.page, size: this.pageSize })
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
          this.errorMessage = 'Unable to load assigned tickets.';
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  clearFilters(): void { this.filterForm.reset({ status: '', category: '', priority: '' }); }

  changePage(page: number): void { this.page = page; this.loadTickets(); }

  async rejectTicket(id: number, event: Event): Promise<void> {
    event.stopPropagation();
    const ticket=this.tickets.find(item=>item.id===id); const result=await this.confirmation.confirm({title:'Reject ticket?',message:`Reject ${ticket?.ticketNumber || `ticket #${id}`} and return it to the unassigned queue?`,confirmText:'Reject ticket',danger:true,inputLabel:'Rejection / escalation reason',inputPlaceholder:'Explain why this ticket is being rejected',inputRequired:true}); if(!result.confirmed)return;
    this.ticketService.reject(id,result.value).subscribe({
      next: () => {
        this.toast.success('Ticket rejected successfully.');
        this.loadTickets();
      },
      error: (error) => this.toast.error(error, 'Unable to reject ticket.'),
    });
  }
}
