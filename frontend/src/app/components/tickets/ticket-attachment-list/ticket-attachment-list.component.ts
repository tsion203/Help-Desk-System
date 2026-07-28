import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketAttachment } from '../../../models/ticket-attachment';

@Component({
  selector: 'app-ticket-attachment-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-attachment-list.component.html',
  styleUrl: './ticket-attachment-list.component.scss',
})
export class TicketAttachmentListComponent {
  attachments: TicketAttachment[] = [];
  loading = false;
  errorMessage = '';
}
