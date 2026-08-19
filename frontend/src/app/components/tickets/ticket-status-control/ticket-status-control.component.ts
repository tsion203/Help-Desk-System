import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { Ticket } from '../../../models/ticket';
import { TicketService } from '../../../services/ticket.service';
import { ToastService } from '../../../services/toast.service';
import { ConfirmationService } from '../../../services/confirmation.service';

@Component({
  selector: 'app-ticket-status-control',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ticket-status-control.component.html',
  styleUrl: './ticket-status-control.component.scss',
})
export class TicketStatusControlComponent implements OnChanges {
  @Input({ required: true }) ticketId = 0;
  @Input({ required: true }) status = '';
  @Input() statuses = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING', 'RESOLVED'];
  @Output() statusUpdated = new EventEmitter<Ticket>();
  readonly statusControl = new FormControl('', { nonNullable: true });
  submitting = false;
  errorMessage = '';

  constructor(private readonly ticketService: TicketService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef, private readonly confirmation: ConfirmationService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['status'] || (changes['statuses'] && !this.statuses.includes(this.statusControl.value))) {
      this.statusControl.setValue(this.statuses.includes(this.status) ? this.status : (this.statuses[0] ?? this.status));
    }
  }

  async updateStatus(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!this.ticketId || !this.statusControl.value || this.submitting) return;
    const newStatus=this.statusControl.value;
    if (['RESOLVED','CLOSED','REOPENED'].includes(newStatus)) { const result=await this.confirmation.confirm({title:`Change ticket to ${newStatus.replace('_',' ')}?`,message:`Change ticket #${this.ticketId} from ${this.status.replace('_',' ')} to ${newStatus.replace('_',' ')}?`,confirmText:`Change to ${newStatus.replace('_',' ')}`}); if(!result.confirmed){this.statusControl.setValue(this.status);return;} }
    this.errorMessage = '';
    this.submitting = true;
    this.ticketService.updateStatus(this.ticketId, this.statusControl.value).pipe(finalize(() => {
      this.submitting = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: (ticket) => { this.status = ticket.status; this.statusControl.setValue(ticket.status); this.toast.success('Ticket status updated successfully.'); this.statusUpdated.emit(ticket); },
      error: (error) => {
        this.errorMessage = this.toast.getErrorMessage(error, 'Unable to update ticket status.');
        this.toast.error(error, this.errorMessage);
        this.cdr.markForCheck();
      },
    });
  }
}
