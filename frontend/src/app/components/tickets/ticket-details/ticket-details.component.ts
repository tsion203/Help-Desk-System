import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Ticket } from '../../../models/ticket';
import { TicketCommentRequest } from '../../../models/ticket-comment';
import { TicketService } from '../../../services/ticket.service';
import { TicketCommentService } from '../../../services/ticket-comment.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ticket-details.component.html',
  styleUrl: './ticket-details.component.scss',
})
export class TicketDetailsComponent implements OnInit {
  ticket: Ticket | null = null;
  loading = false;
  errorMessage = '';
  readonly commentForm = new FormGroup({
    comment: new FormControl('', { nonNullable: true }),
    ticketId: new FormControl(0, { nonNullable: true }),
    userId: new FormControl(0, { nonNullable: true }),
  });
  commentRequest: TicketCommentRequest | null = null;

  constructor(private readonly ticketService: TicketService, private readonly commentService: TicketCommentService, private readonly route: ActivatedRoute) {}
  ngOnInit(): void { const id = Number(this.route.snapshot.paramMap.get('id')); this.loading = true; this.commentForm.patchValue({ ticketId: id }); this.ticketService.getById(id).subscribe({ next: (ticket) => { this.ticket = ticket; this.loading = false; }, error: () => { this.errorMessage = 'Unable to load ticket.'; this.loading = false; } }); }

  onComment(): void {
    const value = this.commentForm.getRawValue();
    this.commentRequest = { ...value, ticketId: Number(value.ticketId), userId: Number(value.userId) };
    this.commentService.create(this.commentRequest).subscribe({
      next: (comment) => { if (this.ticket) this.ticket = { ...this.ticket, comments: [...this.ticket.comments, comment] }; },
      error: () => (this.errorMessage = 'Unable to post comment.'),
    });
  }
}
