import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketAssignmentHistory } from '../../../models/ticket-assignment-history';

@Component({
  selector: 'app-ticket-assignment-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-assignment-history.component.html',
  styleUrl: './ticket-assignment-history.component.scss',
})
export class TicketAssignmentHistoryComponent {
  assignmentHistory: TicketAssignmentHistory[] = [];
  loading = false;
  errorMessage = '';
}
