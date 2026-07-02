import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TechnicianNotification } from '../models/notification.model';
import { NotificationCenterService } from '../../../core/notifications/notification-center.service';

@Injectable({
  providedIn: 'root'
})
export class TechnicianNotificationService {
  private readonly notificationCenter = inject(NotificationCenterService);

  getNotifications(): Observable<TechnicianNotification[]> {
    return this.notificationCenter.getNotifications();
  }

  getTimeline(): Observable<TechnicianNotification[]> {
    return this.notificationCenter.getNotifications();
  }

  markAsRead(id: number): Observable<void> {
    return this.notificationCenter.markAsRead(id);
  }
}
