import { Component } from '@angular/core';
import { TicketCommentService } from '../../../services/ticket-comment.service';

@Component({
  selector: 'app-ticket-comment-form',
  standalone: true,
  imports: [],
  templateUrl: './ticket-comment-form.component.html',
  styleUrl: './ticket-comment-form.component.scss',
})
export class TicketCommentFormComponent {
  constructor(private readonly ticketCommentService: TicketCommentService) {}
}
