import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TicketCommentRequest } from '../../../models/ticket-comment';
import { TicketComment } from '../../../models/ticket-comment';
import { TicketCommentService } from '../../../services/ticket-comment.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ticket-comment-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './ticket-comment-form.component.html',
  styleUrl: './ticket-comment-form.component.scss',
})
export class TicketCommentFormComponent implements OnInit {
  readonly commentForm = new FormGroup({
    comment: new FormControl('', { nonNullable: true }),
    ticketId: new FormControl(0, { nonNullable: true }),
    userId: new FormControl(0, { nonNullable: true }),
  });

  commentRequest: TicketCommentRequest | null = null;
  savedComment: TicketComment | null = null;
  errorMessage = '';

  constructor(private readonly commentService: TicketCommentService, private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    const ticketId = Number(this.route.snapshot.paramMap.get('id'));
    if (ticketId) this.commentForm.patchValue({ ticketId });
  }

  onSave(): void {
    const value = this.commentForm.getRawValue();
    this.commentRequest = {
      ...value,
      ticketId: Number(value.ticketId),
      userId: Number(value.userId),
    };
    this.commentService.create(this.commentRequest).subscribe({
      next: (comment) => (this.savedComment = comment),
      error: () => (this.errorMessage = 'Unable to save comment.'),
    });
  }
}
