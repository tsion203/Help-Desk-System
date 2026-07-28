import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Ticket } from '../../../models/ticket';
import { TicketCommentRequest } from '../../../models/ticket-comment';

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ticket-details.component.html',
  styleUrl: './ticket-details.component.scss',
})
export class TicketDetailsComponent {
  ticket: Ticket | null = null;
  loading = false;
  errorMessage = '';
  readonly commentForm = new FormGroup({
    comment: new FormControl('', { nonNullable: true }),
    ticketId: new FormControl(0, { nonNullable: true }),
    userId: new FormControl(0, { nonNullable: true }),
  });
  commentRequest: TicketCommentRequest | null = null;

  onComment(): void {
    const value = this.commentForm.getRawValue();
    this.commentRequest = { ...value, ticketId: Number(value.ticketId), userId: Number(value.userId) };
  }
}
