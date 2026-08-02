import { ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { merge, switchMap, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TicketService } from '../../../services/ticket.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  totalTickets = 0;
  openTickets = 0;
  inProgressTickets = 0;
  resolvedTickets = 0;
  get isAdmin(): boolean { return this.authService.isAdmin(); }
  get dashboardTitle(): string { return this.authService.isSupervisor() ? 'Supervisor dashboard' : 'Admin dashboard'; }
  loading = false;
  errorMessage = '';

  constructor(
    private readonly ticketService: TicketService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    merge(timer(0, 15000), this.ticketService.ticketsChanged$)
      .pipe(
        switchMap(() => this.ticketService.getAll()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
      next: (tickets) => {
        this.totalTickets = tickets.length;
        this.openTickets = tickets.filter((ticket) => ticket.status === 'OPEN').length;
        this.inProgressTickets = tickets.filter((ticket) => ticket.status === 'IN_PROGRESS').length;
        this.resolvedTickets = tickets.filter((ticket) => ticket.status === 'RESOLVED').length;
        this.errorMessage = '';
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Unable to load dashboard ticket totals.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }
}
