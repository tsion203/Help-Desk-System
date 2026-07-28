import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketAttachment } from '../../../models/ticket-attachment';
import { TicketAttachmentService } from '../../../services/ticket-attachment.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ticket-attachment-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-attachment-list.component.html',
  styleUrl: './ticket-attachment-list.component.scss',
})
export class TicketAttachmentListComponent implements OnInit {
  attachments: TicketAttachment[] = [];
  loading = false;
  errorMessage = '';
  constructor(private readonly attachmentService: TicketAttachmentService, private readonly route: ActivatedRoute) {}
  ngOnInit(): void { const ticketId = Number(this.route.snapshot.paramMap.get('id')); this.loading = true; this.attachmentService.getAll().subscribe({ next: (items) => { this.attachments = ticketId ? items.filter((item) => item.ticketId === ticketId) : items; this.loading = false; }, error: () => { this.errorMessage = 'Unable to load attachments.'; this.loading = false; } }); }
  deleteAttachment(id: number): void { this.attachmentService.delete(id).subscribe({ next: () => (this.attachments = this.attachments.filter((item) => item.id !== id)), error: () => (this.errorMessage = 'Unable to delete attachment.') }); }
}
