import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketComment } from '../../../models/ticket-comment';
import { TicketCommentService } from '../../../services/ticket-comment.service';
import { ToastService } from '../../../services/toast.service';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService } from '../../../services/confirmation.service';

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
  constructor(private readonly commentService: TicketCommentService, private readonly toast: ToastService, private readonly route: ActivatedRoute, private readonly confirmation: ConfirmationService) {}
  ngOnInit(): void { const ticketId = Number(this.route.snapshot.paramMap.get('id')); this.loading = true; this.commentService.getAll().subscribe({ next: (items) => { this.comments = ticketId ? items.filter((item) => item.ticketId === ticketId) : items; this.loading = false; }, error: () => { this.errorMessage = 'Unable to load comments.'; this.loading = false; } }); }
  async deleteComment(id: number): Promise<void> { const result=await this.confirmation.confirm({title:'Delete comment?',message:'Delete this comment? This action cannot be undone.',confirmText:'Delete comment',danger:true}); if(!result.confirmed)return; this.commentService.delete(id).subscribe({ next: () => { this.comments = this.comments.filter((item) => item.id !== id); this.toast.success('Comment deleted successfully.'); }, error: (error) => this.toast.error(error, 'Unable to delete comment.') }); }
}
