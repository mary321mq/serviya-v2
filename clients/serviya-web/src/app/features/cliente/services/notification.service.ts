import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ClienteNotification } from '../models/notification.model';
import { NotificationCenterService } from '../../../core/notifications/notification-center.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly notificationCenter = inject(NotificationCenterService);

  getNotifications(): Observable<ClienteNotification[]> {
    return this.notificationCenter.getNotifications();
  }

  getTimeline(): Observable<ClienteNotification[]> {
    return this.notificationCenter.getNotifications();
  }

  markAsRead(id: number): Observable<void> {
    return this.notificationCenter.markAsRead(id);
  }
}
