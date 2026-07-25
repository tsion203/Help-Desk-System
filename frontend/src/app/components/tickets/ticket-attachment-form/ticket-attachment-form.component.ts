import { Component } from '@angular/core';
import { TicketAttachmentService } from '../../../services/ticket-attachment.service';

@Component({
  selector: 'app-ticket-attachment-form',
  standalone: true,
  imports: [],
  templateUrl: './ticket-attachment-form.component.html',
})
export class TicketAttachmentFormComponent {
  constructor(private readonly ticketAttachmentService: TicketAttachmentService) {}
}
