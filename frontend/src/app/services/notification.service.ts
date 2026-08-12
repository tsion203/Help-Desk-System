import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, map, Observable, timeout, tap } from 'rxjs';

import { Notification } from '../models/notification';
import { environment } from '../../environments/environment';
import { PageRequest, PageResponse } from '../models/page';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly apiUrl = `${environment.apiUrl}/notifications`;
  private readonly unreadCountSubject = new BehaviorSubject<number>(0);
  readonly unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  getNotifications(): Observable<Notification[]> {
    return this.getPage({size:1000}).pipe(map((page)=>page.content));
  }
  getPage(request:PageRequest={}):Observable<PageResponse<Notification>> {
    const params=new HttpParams().set('page',request.page??0).set('size',request.size??5).set('sort',request.sort??'createdAt,desc');
    return this.http.get<PageResponse<NotificationResponse>>(this.apiUrl,{params}).pipe(
      timeout(15000),
      map((page) => ({...page,content:page.content.map((notification)=>this.mapNotification(notification))}))
    );
  }

  getUnreadNotifications(): Observable<Notification[]> {
    return this.http.get<NotificationResponse[]>(`${this.apiUrl}/unread`).pipe(
      map((notifications) => notifications.map((notification) => this.mapNotification(notification)))
    );
  }

  refreshUnreadCount(): void {
    this.getUnreadNotifications().subscribe({
      next: (notifications) => this.unreadCountSubject.next(notifications.length),
      error: () => this.unreadCountSubject.next(0),
    });
  }

  markAsRead(id: number): Observable<Notification> {
    return this.http.patch<NotificationResponse>(`${this.apiUrl}/${id}/read`, {}).pipe(
      map((notification) => this.mapNotification(notification)),
      tap(() => this.refreshUnreadCount())
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => this.refreshUnreadCount())
    );
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
