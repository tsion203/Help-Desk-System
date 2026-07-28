import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketStatusHistory } from '../../../models/ticket-status-history';

@Component({
  selector: 'app-ticket-status-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-status-history.component.html',
  styleUrl: './ticket-status-history.component.scss',
})
export class TicketStatusHistoryComponent {
  statusHistory: TicketStatusHistory[] = [];
  loading = false;
  errorMessage = '';
}
