import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification } from '../../../models/notification';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss',
})
export class NotificationListComponent {
  notifications: Notification[] = [];
  loading = false;
  errorMessage = '';

  get unreadCount(): number {
    return this.notifications.filter((notification) => !notification.isRead).length;
  }
}
