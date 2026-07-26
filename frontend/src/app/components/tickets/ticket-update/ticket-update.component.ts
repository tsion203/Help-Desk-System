import { Component } from '@angular/core';
import { TicketService } from '../../../services/ticket.service';

@Component({
  selector: 'app-ticket-update',
  standalone: true,
  imports: [],
  templateUrl: './ticket-update.component.html',
  styleUrl: './ticket-update.component.scss',
})
export class TicketUpdateComponent {
  constructor(private readonly ticketService: TicketService) {}
}
