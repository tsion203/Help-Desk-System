import { ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { merge, switchMap, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TicketService } from '../../../services/ticket.service';
import { AuthService } from '../../../services/auth.service';
import { DashboardData } from '../../../models/dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  readonly statuses = [
    'OPEN',
    'ASSIGNED',
    'IN_PROGRESS',
    'PENDING',
    'RESOLVED',
    'CLOSED',
    'REOPENED',
  ];
  readonly priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  readonly statusColors: Record<string, string> = {
    OPEN: '#2563eb',
    ASSIGNED: '#7c3aed',
    IN_PROGRESS: '#f59e0b',
    PENDING: '#eab308',
    RESOLVED: '#10b981',
    CLOSED: '#6b7280',
    REOPENED: '#ec4899',
  };
  readonly priorityColors: Record<string, string> = {
    LOW: '#6366f1',
    MEDIUM: '#eab308',
    HIGH: '#f97316',
    CRITICAL: '#ef4444',
  };
  data: DashboardData = {
    totalTickets: 0,
    statusCounts: {},
    priorityCounts: {},
    recentActivity: [],
    supportOfficers: [],
  };
  loading = false;
  errorMessage = '';
  get isAdmin() {
    return this.authService.isAdmin();
  }
  get isSupervisor() {
    return this.authService.isSupervisor();
  }
  get isManager() {
    return this.isAdmin || this.isSupervisor;
  }
  get dashboardTitle() {
    if (this.isSupervisor) return 'Supervisor dashboard';
    if (this.authService.isSupportOfficer()) return 'Support Officer dashboard';
    if (this.authService.isEmployee() && !this.isAdmin) return 'Employee dashboard';
    return 'Admin dashboard';
  }
  get dashboardSubtitle() {
    if (this.authService.isSupportOfficer()) return 'Your assigned tickets and latest activity.';
    if (this.authService.isEmployee() && !this.isManager)
      return 'Your created tickets and latest activity.';
    return 'System activity and support performance at a glance.';
  }
  get totalLabel() {
    if (this.authService.isSupportOfficer()) return 'Total assigned tickets';
    if (this.authService.isEmployee() && !this.isManager) return 'Total created tickets';
    return 'Total tickets';
  }
  get doughnutStyle() {
    if (!this.data.totalTickets) return '#e2e8f0 0 100%';
    let cursor = 0;
    return this.statuses
      .map((status) => {
        const start = cursor;
        cursor += (this.count(status) / this.data.totalTickets) * 100;
        return `${this.statusColors[status]} ${start}% ${cursor}%`;
      })
      .join(', ');
  }
  constructor(
    private readonly ticketService: TicketService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly destroyRef: DestroyRef,
  ) {}
  ngOnInit() {
    this.loading = true;
    merge(timer(0, 15000), this.ticketService.ticketsChanged$)
      .pipe(
        switchMap(() => this.ticketService.getDashboard()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (data) => {
          this.data = data;
          this.errorMessage = '';
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMessage = 'Unable to load dashboard data.';
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }
  count(status: string) {
    return this.data.statusCounts[status] ?? 0;
  }
  priorityCount(priority: string) {
    return this.data.priorityCounts[priority] ?? 0;
  }
  priorityPercent(priority: string) {
    const maximum = Math.max(1, ...this.priorities.map((item) => this.priorityCount(item)));
    return (this.priorityCount(priority) / maximum) * 100;
  }
  label(value: string) {
    return value.replace('_', ' ');
  }
  statusClass(status: string) {
    return `status-${status.toLowerCase().replace('_', '-')}`;
  }
}
