import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketComment } from '../../../models/ticket-comment';
import { TicketCommentService } from '../../../services/ticket-comment.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ticket-comment-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-comment-list.component.html',
  styleUrl: './ticket-comment-list.component.scss',
})
export class TicketCommentListComponent implements OnInit {
  comments: TicketComment[] = [];
  loading = false;
  errorMessage = '';
  constructor(private readonly commentService: TicketCommentService, private readonly route: ActivatedRoute) {}
  ngOnInit(): void { const ticketId = Number(this.route.snapshot.paramMap.get('id')); this.loading = true; this.commentService.getAll().subscribe({ next: (items) => { this.comments = ticketId ? items.filter((item) => item.ticketId === ticketId) : items; this.loading = false; }, error: () => { this.errorMessage = 'Unable to load comments.'; this.loading = false; } }); }
  deleteComment(id: number): void { this.commentService.delete(id).subscribe({ next: () => (this.comments = this.comments.filter((item) => item.id !== id)), error: () => (this.errorMessage = 'Unable to delete comment.') }); }
}
