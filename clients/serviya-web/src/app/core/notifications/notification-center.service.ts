import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiClientService } from '../http/api-client.service';
import { AppNotification, isNotificationUnread } from './app-notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationCenterService {
  private readonly api = inject(ApiClientService);
  private readonly basePath = '/notification-ms/api/v1/notifications';

  getNotifications(): Observable<AppNotification[]> {
    return this.api.get<AppNotification[]>(`${this.basePath}/me`).pipe(
      map((notifications) => notifications.map((notification) => this.normalize(notification)))
    );
  }

  getUnreadCount(): Observable<number> {
    return this.api.get<{ count: number }>(`${this.basePath}/me/unread-count`).pipe(map((response) => response.count ?? 0));
  }

  markAsRead(id: number): Observable<void> {
    return this.api.put<void, Record<string, never>>(`${this.basePath}/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.api.put<void, Record<string, never>>(`${this.basePath}/me/read-all`, {});
  }

  ensureWelcome(): Observable<void> {
    return this.api.post<void, Record<string, never>>(`${this.basePath}/me/welcome`, {});
  }

  unreadCountFrom(notifications: AppNotification[]): number {
    return notifications.filter(isNotificationUnread).length;
  }

  private normalize(notification: AppNotification): AppNotification {
    const unread = isNotificationUnread(notification);
    return {
      ...notification,
      status: unread ? 'UNREAD' : 'READ',
      read: !unread
    };
  }
}
