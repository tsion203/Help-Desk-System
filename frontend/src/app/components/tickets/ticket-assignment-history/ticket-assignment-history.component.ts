import { Component } from '@angular/core';
import { TicketService } from '../../../services/ticket.service';

@Component({
  selector: 'app-ticket-assignment-history',
  standalone: true,
  imports: [],
  templateUrl: './ticket-assignment-history.component.html',
})
export class TicketAssignmentHistoryComponent {
  constructor(private readonly ticketService: TicketService) {}
}
