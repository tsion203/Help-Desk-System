import { Component } from '@angular/core';
import { TicketService } from '../../../services/ticket.service';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [],
  templateUrl: './ticket-list.component.html',
  styleUrl: './ticket-list.component.scss',
})
export class TicketListComponent {
  constructor(private readonly ticketService: TicketService) {}
}
