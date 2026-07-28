import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  metrics = [
    { label: 'Total tickets', value: 0, detail: 'All requests' },
    { label: 'Open', value: 0, detail: 'Needs attention' },
    { label: 'In progress', value: 0, detail: 'Active work' },
    { label: 'Resolved', value: 0, detail: 'Completed' },
  ];
  isAdmin = false;
  loading = false;
  errorMessage = '';
}
