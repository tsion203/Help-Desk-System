import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY, catchError, distinctUntilChanged, finalize, map, retry, switchMap, timeout } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Ticket } from '../../../models/ticket';
import { TicketService } from '../../../services/ticket.service';

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ticket-details.component.html',
  styleUrl: './ticket-details.component.scss',
})
export class TicketDetailsComponent implements OnInit {
  ticket: Ticket | null = null;
  loading = false;
  errorMessage = '';
  activeTab: 'comments' | 'status' | 'assignment' = 'comments';
  ticketId = 0;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly ticketService: TicketService,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map((params) => Number(params.get('id'))),
      distinctUntilChanged(),
      switchMap((id) => this.fetchTicket(id)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  retryLoad(): void {
    if (this.ticketId > 0) {
      this.fetchTicket(this.ticketId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
  }

  private fetchTicket(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      this.loading = false;
      this.errorMessage = 'Invalid ticket ID.';
      this.ticket = null;
      this.cdr.markForCheck();
      return EMPTY;
    }

    this.ticketId = id;
    this.loading = true;
    this.errorMessage = '';
    this.ticket = null;
    this.cdr.markForCheck();

    return this.ticketService.getById(id).pipe(
      timeout(15000),
      retry({ count: 1, delay: 500 }),
      map((ticket) => {
        this.ticket = {
          ...ticket,
          comments: ticket.comments ?? [],
          statusHistory: ticket.statusHistory ?? [],
          assignmentHistory: ticket.assignmentHistory ?? [],
        };
        return ticket;
      }),
      catchError(() => {
        this.errorMessage = 'Unable to load ticket details. Please try again.';
        return EMPTY;
      }),
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }),
    );
  }

  selectTab(tab: 'comments' | 'status' | 'assignment'): void {
    this.activeTab = tab;
  }

  formatBadgeStatus(status: string): string {
    switch (status) {
      case 'OPEN':
        return 'status-open';
      case 'IN_PROGRESS':
        return 'status-progress';
      case 'RESOLVED':
        return 'status-resolved';
      case 'CLOSED':
        return 'status-closed';
      default:
        return '';
    }
  }

  formatBadgePriority(priority: string): string {
    switch (priority) {
      case 'LOW':
        return 'priority-low';
      case 'MEDIUM':
        return 'priority-medium';
      case 'HIGH':
        return 'priority-high';
      case 'CRITICAL':
        return 'priority-critical';
      default:
        return '';
    }
  }

  formatLabel(value: string): string {
    return value?.replace(/_/g, ' ') ?? '';
  }
}
