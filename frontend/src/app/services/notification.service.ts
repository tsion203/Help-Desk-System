import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, timeout } from 'rxjs';

import { Notification } from '../models/notification';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private readonly http: HttpClient) {}

  getNotifications(): Observable<Notification[]> {
    return this.http.get<NotificationResponse[]>(this.apiUrl).pipe(
      timeout(15000),
      map((notifications) => notifications.map((notification) => this.mapNotification(notification)))
    );
  }

  getUnreadNotifications(): Observable<Notification[]> {
    return this.http.get<NotificationResponse[]>(`${this.apiUrl}/unread`).pipe(
      map((notifications) => notifications.map((notification) => this.mapNotification(notification)))
    );
  }

  markAsRead(id: number): Observable<Notification> {
    return this.http.patch<NotificationResponse>(`${this.apiUrl}/${id}/read`, {}).pipe(
      map((notification) => this.mapNotification(notification))
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/read-all`, {});
  }

  private mapNotification(response: NotificationResponse): Notification {
    return {
      ...response,
      isRead: response.isRead ?? response.read ?? false,
    };
  }
}

type NotificationResponse = Omit<Notification, 'isRead'> & {
  isRead?: boolean;
  read?: boolean;
};
