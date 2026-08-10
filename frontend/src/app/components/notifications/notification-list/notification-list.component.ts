import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { Notification } from '../../../models/notification';
import { NotificationService } from '../../../services/notification.service';
import { GlobalSearchService } from '../../../services/global-search.service';
import { GlobalSearchPipe } from '../../shared/global-search/global-search.pipe';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

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
  errorMessage = '';
  readonly globalSearch = inject(GlobalSearchService);
  page=0;readonly pageSize=5;totalElements=0;totalPages=0;

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

  isResolved(notification: Notification): boolean {
    return `${notification.type} ${notification.title}`.toLowerCase().includes('resolv');
  }

  get unreadCount(): number {
    return this.notifications.filter((notification) => !notification.isRead).length;
  }
}
