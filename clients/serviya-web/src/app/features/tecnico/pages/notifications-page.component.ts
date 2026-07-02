import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';

import { TechnicianNotification } from '../models/notification.model';
import { TechnicianNotificationService } from '../services/technician-notification.service';

@Component({
  selector: 'app-technician-notifications-page',
  standalone: true,
  imports: [RouterLink, DatePipe, CommonModule],
  template: `
    <section class="page-header">
      <div>
        <a routerLink="/tecnico" class="eyebrow">&lt; Volver</a>
        <h1>Notificaciones / Wallet Info</h1>
      </div>
    </section>

    <div class="page-panel list-panel">
      <div *ngIf="notifications.length === 0" class="empty-state">
        <p>No tienes eventos recientes.</p>
      </div>

      <div *ngFor="let notification of notifications; trackBy: trackById" class="list-item notification-item" [class.unread]="notification.status === 'UNREAD'">
        <div class="info">
          <h3>{{ notification.title }}</h3>
          <p>{{ notification.message }}</p>
          <span class="eyebrow">{{ notification.createdAt | date:'short' }}</span>
        </div>
        <div class="actions">
          <button *ngIf="notification.status === 'UNREAD'" class="text-button" (click)="markAsRead(notification)">Marcar como leido</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .unread {
      border-left: 4px solid var(--primary-color, #2563eb);
      background-color: #eff6ff;
    }
    .empty-state { padding: 2rem; text-align: center; color: #6b7280; }
  `]
})
export class NotificationsPageComponent implements OnInit {
  private readonly notificationService = inject(TechnicianNotificationService);

  notifications: TechnicianNotification[] = [];

  ngOnInit(): void {
    this.loadTimeline();
  }

  private loadTimeline(): void {
    this.notificationService.getTimeline().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
      },
      error: () => console.error('Error loading timeline')
    });
  }

  markAsRead(notification: TechnicianNotification): void {
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.status = 'READ';
      }
    });
  }

  trackById(index: number, item: TechnicianNotification): number {
    return item.id;
  }
}
