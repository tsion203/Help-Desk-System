import { Component } from '@angular/core';
import { TicketService } from '../../../services/ticket.service';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [],
  templateUrl: './ticket-form.component.html',
})
export class TicketFormComponent {
  constructor(private readonly ticketService: TicketService) {}
}
