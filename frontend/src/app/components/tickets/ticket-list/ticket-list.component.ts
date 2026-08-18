import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
import { TicketAssignmentControlComponent } from '../ticket-assignment-control/ticket-assignment-control.component';
import { TicketStatusControlComponent } from '../ticket-status-control/ticket-status-control.component';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterLink, GlobalSearchPipe, ReactiveFormsModule, PaginationComponent, TicketAssignmentControlComponent, TicketStatusControlComponent],
  templateUrl: './ticket-list.component.html',
  styleUrl: './ticket-list.component.scss',
})
export class TicketListComponent implements OnInit {
  tickets: Ticket[] = [];
  loading = false;
  errorMessage = '';
  selectedTicketForAssignment: Ticket | null = null;
  selectedTicketForStatus: Ticket | null = null;
  currentUserId = 0;
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
  constructor(private readonly ticketService: TicketService, private readonly categoryService: TicketCategoryService, private readonly userService: UserService, private readonly authService: AuthService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef) {}
  get canCreate(): boolean { return this.authService.isEmployee() && !this.authService.isAdmin(); }
  get canUpdate(): boolean { return this.authService.isEmployee(); }
  get canAssign(): boolean { return this.authService.isAdmin() || this.authService.isSupervisor(); }
  get canDelete(): boolean { return this.authService.isAdmin() || this.authService.isEmployee(); }
  ngOnInit(): void {
    this.loadTickets();
    this.userService.getCurrentProfile().subscribe({ next: (user) => { this.currentUserId = user.id; this.cdr.markForCheck(); }, error: (error) => this.toast.error(error, 'Unable to identify the current user.') });
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
  openAssignment(ticket: Ticket, event: Event): void { event.stopPropagation(); this.selectedTicketForAssignment = ticket; }
  closeAssignment(): void { this.selectedTicketForAssignment = null; }
  assignmentUpdated(updatedTicket: Ticket): void {
    this.tickets = this.tickets.map((ticket) => ticket.id === updatedTicket.id ? updatedTicket : ticket);
    this.closeAssignment();
    this.cdr.markForCheck();
  }
  canUpdateTicket(ticket: Ticket): boolean { return this.canUpdate && ticket.status !== 'CLOSED'; }
  canAssignTicket(ticket: Ticket): boolean { return this.canAssign && ticket.status !== 'CLOSED'; }
  canDeleteTicket(ticket: Ticket): boolean { return this.canDelete && ticket.status !== 'CLOSED'; }
  statusOptions(ticket: Ticket): string[] {
    const requester = ticket.createdById === this.currentUserId;
    if (ticket.status === 'CLOSED') return requester ? ['REOPENED'] : [];
    if (requester) return ['CLOSED'];
    if (this.authService.isSupportOfficer() && ticket.assignedToId === this.currentUserId) {
      return ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING', 'RESOLVED'];
    }
    return [];
  }
  canUpdateStatus(ticket: Ticket): boolean { return this.statusOptions(ticket).length > 0; }
  canReject(ticket: Ticket): boolean { return ticket.status !== 'CLOSED' && this.authService.isSupportOfficer() && ticket.assignedToId === this.currentUserId; }
  openStatus(ticket: Ticket, event: Event): void { event.stopPropagation(); this.selectedTicketForStatus = ticket; }
  closeStatus(): void { this.selectedTicketForStatus = null; }
  statusUpdated(updatedTicket: Ticket): void { this.tickets = this.tickets.map((ticket) => ticket.id === updatedTicket.id ? updatedTicket : ticket); this.closeStatus(); this.cdr.markForCheck(); }
  rejectTicket(id: number, event: Event): void {
    event.stopPropagation();
    this.ticketService.reject(id).subscribe({
      next: () => {
        this.toast.success('Ticket rejected successfully.');
        if (this.tickets.length === 1 && this.page > 0) this.page--;
        this.loadTickets();
      },
      error: (error) => this.toast.error(error, 'Unable to reject ticket.'),
    });
  }
  deleteTicket(id: number, event: Event): void { event.stopPropagation(); this.ticketService.delete(id).subscribe({ next: () => { if(this.tickets.length===1&&this.page>0)this.page--; this.loadTickets(); this.toast.success('Ticket deleted successfully.'); }, error: (error) => this.toast.error(error, 'Unable to delete ticket.') }); }
}
