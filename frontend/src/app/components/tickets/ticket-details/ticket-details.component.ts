import { Component } from '@angular/core';
import { TicketService } from '../../../services/ticket.service';

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [],
  templateUrl: './ticket-details.component.html',
  styleUrl: './ticket-details.component.scss',
})
export class TicketDetailsComponent {
  constructor(private readonly ticketService: TicketService) {}
}
