import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  metrics = [
    { label: 'Total tickets', value: 0, detail: 'All requests' },
    { label: 'Open', value: 0, detail: 'Needs attention' },
    { label: 'In progress', value: 0, detail: 'Active work' },
    { label: 'Resolved', value: 0, detail: 'Completed' },
  ];
  isAdmin = false;
  loading = false;
  errorMessage = '';
  constructor(private readonly notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loading = true;
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => { this.metrics[0].value = notifications.length; this.loading = false; },
      error: () => { this.errorMessage = 'Unable to load dashboard data.'; this.loading = false; },
    });
  }
}
