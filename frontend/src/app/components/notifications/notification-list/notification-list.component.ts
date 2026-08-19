import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { Notification } from '../../../models/notification';
import { NotificationService } from '../../../services/notification.service';
import { GlobalSearchService } from '../../../services/global-search.service';
import { GlobalSearchPipe } from '../../shared/global-search/global-search.pipe';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { ConfirmationService } from '../../../services/confirmation.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, GlobalSearchPipe, PaginationComponent],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss',
})
export class NotificationListComponent implements OnInit {
  notifications: Notification[] = [];
  loading = false;
  markingAllRead = false;
  deletingAll = false;
  deletingIds = new Set<number>();
  errorMessage = '';
  readonly globalSearch = inject(GlobalSearchService);
  page=0;readonly pageSize=5;totalElements=0;totalPages=0;

  constructor(
    private readonly notificationService: NotificationService,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly confirmation: ConfirmationService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.errorMessage = '';
    this.notificationService.getPage({page:this.page,size:this.pageSize}).pipe(
      finalize(() => {
        this.loading = false;
        this.changeDetector.detectChanges();
      })
    ).subscribe({
      next: (result) => {
        this.notifications=result.content;this.totalElements=result.totalElements;this.totalPages=result.totalPages;this.page=result.number;
      },
      error: () => {
        this.notifications = [];
        this.errorMessage = 'Unable to load notifications. Please try again.';
      },
    });
  }
  changePage(page:number):void{this.page=page;this.loadNotifications()}

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

  async deleteNotification(notification: Notification, event: Event): Promise<void> {
    event.stopPropagation();
    if (this.deletingIds.has(notification.id)) return;
    const result = await this.confirmation.confirm({ title: 'Delete notification?', message: `Delete “${notification.title}”?`, confirmText: 'Delete notification', danger: true });
    if (!result.confirmed) return;
    this.deletingIds.add(notification.id);
    this.notificationService.delete(notification.id).pipe(finalize(() => { this.deletingIds.delete(notification.id); this.changeDetector.detectChanges(); })).subscribe({
      next: () => { if (this.notifications.length === 1 && this.page > 0) this.page--; this.loadNotifications(); this.toast.success('Notification deleted successfully.'); },
      error: (error) => this.toast.error(error, 'Unable to delete notification.'),
    });
  }

  async deleteAll(): Promise<void> {
    if (this.totalElements === 0 || this.deletingAll) return;
    const result = await this.confirmation.confirm({ title: 'Clear all notifications?', message: 'Delete all of your notifications? This action cannot be undone.', confirmText: 'Clear all', danger: true });
    if (!result.confirmed) return;
    this.deletingAll = true;
    this.notificationService.deleteAll().pipe(finalize(() => { this.deletingAll = false; this.changeDetector.detectChanges(); })).subscribe({
      next: () => { this.page = 0; this.notifications = []; this.totalElements = 0; this.totalPages = 0; this.toast.success('All notifications cleared.'); },
      error: (error) => this.toast.error(error, 'Unable to clear notifications.'),
    });
  }

  isResolved(notification: Notification): boolean {
    return `${notification.type} ${notification.title}`.toLowerCase().includes('resolv');
  }

  get unreadCount(): number {
    return this.notifications.filter((notification) => !notification.isRead).length;
  }
}
