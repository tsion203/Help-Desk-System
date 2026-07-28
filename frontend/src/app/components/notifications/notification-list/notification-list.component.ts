import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification } from '../../../models/notification';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss',
})
export class NotificationListComponent implements OnInit {
  notifications: Notification[] = [];
  loading = false;
  errorMessage = '';
  constructor(private readonly notificationService: NotificationService) {}
  ngOnInit(): void { this.loading = true; this.notificationService.getNotifications().subscribe({ next: (items) => { this.notifications = items; this.loading = false; }, error: () => { this.errorMessage = 'Unable to load notifications.'; this.loading = false; } }); }
  markAsRead(id: number): void { this.notificationService.markAsRead(id).subscribe({ next: (updated) => (this.notifications = this.notifications.map((item) => item.id === id ? updated : item)), error: () => (this.errorMessage = 'Unable to update notification.') }); }

  get unreadCount(): number {
    return this.notifications.filter((notification) => !notification.isRead).length;
  }
}
