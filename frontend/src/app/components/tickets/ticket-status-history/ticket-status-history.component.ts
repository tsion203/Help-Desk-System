import { Component } from '@angular/core';
import { TicketService } from '../../../services/ticket.service';

@Component({
  selector: 'app-ticket-status-history',
  standalone: true,
  imports: [],
  templateUrl: './ticket-status-history.component.html',
})
export class TicketStatusHistoryComponent {
  constructor(private readonly ticketService: TicketService) {}
}
