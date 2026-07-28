import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketComment } from '../../../models/ticket-comment';

@Component({
  selector: 'app-ticket-comment-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-comment-list.component.html',
  styleUrl: './ticket-comment-list.component.scss',
})
export class TicketCommentListComponent {
  comments: TicketComment[] = [];
  loading = false;
  errorMessage = '';
}
