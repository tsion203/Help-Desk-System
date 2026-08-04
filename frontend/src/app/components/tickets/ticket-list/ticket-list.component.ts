import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Ticket } from '../../../models/ticket';
import { TicketService } from '../../../services/ticket.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { GlobalSearchService } from '../../../services/global-search.service';
import { GlobalSearchPipe } from '../../shared/global-search/global-search.pipe';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterLink, GlobalSearchPipe],
  templateUrl: './ticket-list.component.html',
  styleUrl: './ticket-list.component.scss',
})
export class TicketListComponent implements OnInit {
  tickets: Ticket[] = [];
  loading = false;
  errorMessage = '';
  readonly globalSearch = inject(GlobalSearchService);
  constructor(private readonly ticketService: TicketService, private readonly authService: AuthService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef, private readonly router: Router) {}
  get canCreate(): boolean { return this.authService.isAdmin() || this.authService.isEmployee(); }
  get canUpdate(): boolean { return true; }
  get canDelete(): boolean { return this.authService.isAdmin() || this.authService.isEmployee(); }
  ngOnInit(): void { this.loading = true; this.ticketService.getAll().subscribe({ next: (items) => { this.tickets = items; this.loading = false; this.cdr.markForCheck(); }, error: () => { this.errorMessage = 'Unable to load tickets.'; this.loading = false; this.cdr.markForCheck(); } }); }
  editTicket(id: number): void { void this.router.navigate(['/tickets', id, 'edit']); }
  deleteTicket(id: number, event: Event): void { event.stopPropagation(); this.ticketService.delete(id).subscribe({ next: () => { this.tickets = this.tickets.filter((item) => item.id !== id); this.toast.success('Ticket deleted successfully.'); }, error: (error) => this.toast.error(error, 'Unable to delete ticket.') }); }
}
