import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
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

  constructor(
    private readonly notificationService: NotificationService,
    private readonly changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.errorMessage = '';
    this.notificationService.getNotifications().pipe(
      finalize(() => {
        this.loading = false;
        this.changeDetector.detectChanges();
      })
    ).subscribe({
      next: (notifications) => {
        this.notifications = notifications;
      },
      error: () => {
        this.notifications = [];
        this.errorMessage = 'Unable to load notifications. Please try again.';
      },
    });
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe({
      next: (updated) => {
        this.notifications = this.notifications.map((notification) =>
          notification.id === id ? updated : notification
        );
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Unable to update notification.';
        this.changeDetector.detectChanges();
      },
    });
  }

  get unreadCount(): number {
    return this.notifications.filter((notification) => !notification.isRead).length;
  }
}
