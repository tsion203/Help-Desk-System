import { Component } from '@angular/core';
import { TicketCommentService } from '../../../services/ticket-comment.service';

@Component({
  selector: 'app-ticket-comment-list',
  standalone: true,
  imports: [],
  templateUrl: './ticket-comment-list.component.html',
})
export class TicketCommentListComponent {
  constructor(private readonly ticketCommentService: TicketCommentService) {}
}
