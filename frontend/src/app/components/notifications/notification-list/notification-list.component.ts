import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { Notification } from '../../../models/notification';
import { NotificationService } from '../../../services/notification.service';
import { GlobalSearchService } from '../../../services/global-search.service';
import { GlobalSearchPipe } from '../../shared/global-search/global-search.pipe';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, GlobalSearchPipe],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss',
})
export class NotificationListComponent implements OnInit {
  notifications: Notification[] = [];
  loading = false;
  markingAllRead = false;
  errorMessage = '';
  readonly globalSearch = inject(GlobalSearchService);

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

  markAllAsRead(): void {
    if (this.unreadCount === 0 || this.markingAllRead) return;

    this.markingAllRead = true;
    this.errorMessage = '';
    this.notificationService.markAllAsRead().pipe(
      finalize(() => {
        this.markingAllRead = false;
        this.changeDetector.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.notifications = this.notifications.map((notification) => ({ ...notification, isRead: true }));
      },
      error: () => {
        this.errorMessage = 'Unable to mark all notifications as read.';
      },
    });
  }

  isResolved(notification: Notification): boolean {
    return `${notification.type} ${notification.title}`.toLowerCase().includes('resolv');
  }

  get unreadCount(): number {
    return this.notifications.filter((notification) => !notification.isRead).length;
  }
}
