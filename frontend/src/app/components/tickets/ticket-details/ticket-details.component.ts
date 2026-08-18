import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY, catchError, distinctUntilChanged, finalize, map, retry, switchMap, timeout } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Ticket } from '../../../models/ticket';
import { TicketCommentRequest } from '../../../models/ticket-comment';
import { TicketService } from '../../../services/ticket.service';
import { TicketCommentService } from '../../../services/ticket-comment.service';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { TicketAttachmentFormComponent } from '../ticket-attachment-form/ticket-attachment-form.component';
import { TicketAttachmentListComponent } from '../ticket-attachment-list/ticket-attachment-list.component';
import { TicketAssignmentControlComponent } from '../ticket-assignment-control/ticket-assignment-control.component';
import { TicketStatusControlComponent } from '../ticket-status-control/ticket-status-control.component';

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TicketAttachmentFormComponent, TicketAttachmentListComponent, TicketAssignmentControlComponent, TicketStatusControlComponent],
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.scss'],
})
export class TicketDetailsComponent implements OnInit {
  ticket: Ticket | null = null;
  loading = false;
  errorMessage = '';
  activeTab: 'comments' | 'status' | 'assignment' | 'attachments' = 'comments';
  ticketId = 0;
  submittingComment = false;
  commentForm = new FormGroup({ comment: new FormControl('', { nonNullable: true, validators: [Validators.required] }) });
  private currentUserId = 0;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly ticketService: TicketService,
    private readonly commentService: TicketCommentService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly toast: ToastService,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
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
          attachments: ticket.attachments ?? [],
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

  get canUpdateDetails(): boolean {
    return this.authService.isEmployee();
  }

  get canManageAssignment(): boolean {
    return this.authService.isAdmin() || this.authService.isSupervisor();
  }

  get canUpdateStatus(): boolean { return this.authService.isSupportOfficer() && this.ticket?.assignedToId != null; }

  statusUpdated(ticket: Ticket): void { this.assignmentUpdated(ticket); }

  assignmentUpdated(ticket: Ticket): void {
    this.ticket = {
      ...ticket,
      comments: ticket.comments ?? [],
      attachments: ticket.attachments ?? [],
      statusHistory: ticket.statusHistory ?? [],
      assignmentHistory: ticket.assignmentHistory ?? [],
    };
    this.cdr.markForCheck();
  }

  selectTab(tab: 'comments' | 'status' | 'assignment' | 'attachments'): void {
    this.activeTab = tab;
  }

  submitComment(): void {
    const commentText = this.commentForm.controls.comment.value.trim();
    if (!commentText) {
      this.toast.error(null, 'Enter a comment before sending.');
      return;
    }
    if (!this.ticketId || !this.currentUserId) {
      this.toast.error(null, 'Unable to add a comment at this time.');
      return;
    }

    this.submittingComment = true;
    const request: TicketCommentRequest = {
      comment: commentText,
      ticketId: this.ticketId,
      userId: this.currentUserId,
    };

    this.commentService.create(request).pipe(finalize(() => {
      this.submittingComment = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: () => {
        this.toast.success('Comment added successfully.');
        this.commentForm.reset({ comment: '' });
        this.fetchTicket(this.ticketId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
      },
      error: (error) => {
        this.toast.error(error, 'Unable to add comment.');
      },
    });
  }

  private loadCurrentUser(): void {
    this.userService.getCurrentProfile().subscribe({
      next: (user) => {
        this.currentUserId = user.id;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error(null, 'Unable to identify the current user.');
      },
    });
  }

  refreshAttachments(): void {
    if (this.ticketId > 0) {
      this.fetchTicket(this.ticketId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
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
