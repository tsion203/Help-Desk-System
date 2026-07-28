import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketStatusHistory } from '../../../models/ticket-status-history';
import { TicketService } from '../../../services/ticket.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ticket-status-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-status-history.component.html',
  styleUrl: './ticket-status-history.component.scss',
})
export class TicketStatusHistoryComponent implements OnInit {
  statusHistory: TicketStatusHistory[] = [];
  loading = false;
  errorMessage = '';
  constructor(private readonly ticketService: TicketService, private readonly route: ActivatedRoute) {}
  ngOnInit(): void { const id = Number(this.route.snapshot.paramMap.get('id')); this.loading = true; this.ticketService.getStatusHistory(id).subscribe({ next: (items) => { this.statusHistory = items; this.loading = false; }, error: () => { this.errorMessage = 'Unable to load status history.'; this.loading = false; } }); }
}
