import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TicketCommentRequest } from '../../../models/ticket-comment';

@Component({
  selector: 'app-ticket-comment-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './ticket-comment-form.component.html',
  styleUrl: './ticket-comment-form.component.scss',
})
export class TicketCommentFormComponent {
  readonly commentForm = new FormGroup({
    comment: new FormControl('', { nonNullable: true }),
    ticketId: new FormControl(0, { nonNullable: true }),
    userId: new FormControl(0, { nonNullable: true }),
  });

  commentRequest: TicketCommentRequest | null = null;

  onSave(): void {
    const value = this.commentForm.getRawValue();
    this.commentRequest = {
      ...value,
      ticketId: Number(value.ticketId),
      userId: Number(value.userId),
    };
  }
}
