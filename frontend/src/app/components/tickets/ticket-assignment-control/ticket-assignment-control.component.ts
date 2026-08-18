import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { Ticket } from '../../../models/ticket';
import { TicketAssigneeOption } from '../../../models/ticket-assignee-option';
import { TicketService } from '../../../services/ticket.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-ticket-assignment-control',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ticket-assignment-control.component.html',
  styleUrl: './ticket-assignment-control.component.scss',
})
export class TicketAssignmentControlComponent implements OnChanges {
  @Input({ required: true }) ticketId = 0;
  @Input() assignedToId: number | null = null;
  @Output() assignmentUpdated = new EventEmitter<Ticket>();

  candidates: TicketAssigneeOption[] = [];
  loading = false;
  submitting = false;
  readonly form = new FormGroup({
    assignedToId: new FormControl(0, { nonNullable: true }),
  });

  constructor(
    private readonly ticketService: TicketService,
    private readonly toast: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['assignedToId']) {
      this.form.controls.assignedToId.setValue(this.assignedToId ?? 0);
    }
    if (changes['ticketId'] && this.ticketId > 0) {
      this.loadCandidates();
    }
  }

  optionLabel(candidate: TicketAssigneeOption): string {
    const suffix = candidate.activeTicketCount === 1 ? 'ticket' : 'tickets';
    return `${candidate.firstName} ${candidate.lastName} [${candidate.activeTicketCount} ${suffix}]`;
  }

  updateAssignment(): void {
    if (!this.ticketId || this.submitting) return;
    this.submitting = true;
    this.ticketService.updateAssignment(this.ticketId, this.form.controls.assignedToId.value).pipe(
      finalize(() => {
        this.submitting = false;
        this.cdr.markForCheck();
      }),
    ).subscribe({
      next: (ticket) => {
        this.assignedToId = ticket.assignedToId ?? null;
        this.form.controls.assignedToId.setValue(ticket.assignedToId ?? 0);
        this.toast.success('Ticket assignment updated successfully.');
        this.assignmentUpdated.emit(ticket);
        this.loadCandidates();
      },
      error: (error) => this.toast.error(error, 'Unable to update ticket assignment.'),
    });
  }

  private loadCandidates(): void {
    this.loading = true;
    this.ticketService.getAssignmentCandidates(this.ticketId).pipe(finalize(() => {
      this.loading = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: (candidates) => {
        this.candidates = candidates;
      },
      error: (error) => this.toast.error(error, 'Unable to load assignees.'),
    });
  }
}
