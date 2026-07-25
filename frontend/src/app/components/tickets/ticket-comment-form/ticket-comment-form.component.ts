import { Component } from '@angular/core';
import { TicketCommentService } from '../../../services/ticket-comment.service';

@Component({
  selector: 'app-ticket-comment-form',
  standalone: true,
  imports: [],
  templateUrl: './ticket-comment-form.component.html',
})
export class TicketCommentFormComponent {
  constructor(private readonly ticketCommentService: TicketCommentService) {}
}
