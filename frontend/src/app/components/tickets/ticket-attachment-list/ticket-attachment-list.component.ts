import { Component } from '@angular/core';
import { TicketAttachmentService } from '../../../services/ticket-attachment.service';

@Component({
  selector: 'app-ticket-attachment-list',
  standalone: true,
  imports: [],
  templateUrl: './ticket-attachment-list.component.html',
})
export class TicketAttachmentListComponent {
  constructor(private readonly ticketAttachmentService: TicketAttachmentService) {}
}
