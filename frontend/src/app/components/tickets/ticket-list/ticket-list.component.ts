import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ticket } from '../../../models/ticket';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-list.component.html',
  styleUrl: './ticket-list.component.scss',
})
export class TicketListComponent {
  tickets: Ticket[] = [];
  loading = false;
  errorMessage = '';
}
