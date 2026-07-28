import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketAssignmentHistory } from '../../../models/ticket-assignment-history';
import { TicketService } from '../../../services/ticket.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ticket-assignment-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-assignment-history.component.html',
  styleUrl: './ticket-assignment-history.component.scss',
})
export class TicketAssignmentHistoryComponent implements OnInit {
  assignmentHistory: TicketAssignmentHistory[] = [];
  loading = false;
  errorMessage = '';
  constructor(private readonly ticketService: TicketService, private readonly route: ActivatedRoute) {}
  ngOnInit(): void { const id = Number(this.route.snapshot.paramMap.get('id')); this.loading = true; this.ticketService.getAssignmentHistory(id).subscribe({ next: (items) => { this.assignmentHistory = items; this.loading = false; }, error: () => { this.errorMessage = 'Unable to load assignment history.'; this.loading = false; } }); }
}
