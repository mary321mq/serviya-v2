import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subscription, interval } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { AuthService } from '../auth/auth.service';
import { AppNotification, isNotificationUnread } from '../notifications/app-notification.model';
import { NotificationCenterService } from '../notifications/notification-center.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (showNavbar()) {
      <header class="topbar">
        <div class="session">
          <div class="notification-wrapper">
          <button type="button" class="notification-bell" (click)="toggleNotifications()" aria-label="Notificaciones">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            @if (unreadCount > 0) {
              <span class="badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
            }
          </button>

          @if (notificationsOpen) {
            <div class="notifications-menu">
              <div class="notifications-header">
                <strong>Notificaciones</strong>
                @if (unreadCount > 0) {
                  <button type="button" class="text-action" (click)="markAllAsRead()">Leer todo</button>
                }
              </div>

              @if (notifications.length === 0) {
                <div class="notification-empty">No tienes notificaciones recientes.</div>
              }

              @for (notification of notifications.slice(0, 5); track notification.id) {
                <button type="button" class="notification-row" [class.unread]="isUnread(notification)" (click)="openNotification(notification)">
                  <span class="notification-dot"></span>
                  <span class="notification-content">
                    <strong>{{ notification.title }}</strong>
                    <small>{{ notification.message }}</small>
                  </span>
                </button>
              }

              <button type="button" class="notifications-footer" (click)="goToNotifications()">Ver todas</button>
            </div>
          }
          </div>

          <div class="user-profile-container">
            @if (auth.isAuthenticated()) {
              <div class="user-profile">
                <div class="avatar">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div class="user-info">
                  <span class="user-name">{{ auth.username() }}</span>
                  <span class="user-role">{{ auth.roles().includes('ADMIN') ? 'Super Admin' : (auth.roles()[0] | titlecase) }}</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" style="margin-left: 8px; cursor: pointer;" (click)="logout()"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            } @else {
              <button type="button" class="action-button" (click)="login()">Entrar</button>
            }
          </div>
        </div>
      </header>
    }
  `,
  styles: [`
    .notification-wrapper {
      position: relative;
    }

    .notification-bell {
      border: 0;
      background: transparent;
    }

    .notifications-menu {
      position: absolute;
      top: 48px;
      right: 0;
      width: 360px;
      max-width: calc(100vw - 32px);
      background: var(--surface-1);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      box-shadow: 0 18px 50px rgba(0, 0, 0, 0.4);
      z-index: 50;
      overflow: hidden;
    }

    .notifications-header,
    .notifications-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      background: var(--surface-2);
      color: var(--text-primary);
    }

    .text-action,
    .notifications-footer {
      border: 0;
      color: #3B82F6;
      background: transparent;
      font-weight: 700;
      cursor: pointer;
    }

    .notification-empty {
      padding: 18px 16px;
      color: var(--text-secondary);
      font-size: 0.92rem;
    }

    .notification-row {
      width: 100%;
      border: 0;
      border-top: 1px solid var(--border-color);
      background: transparent;
      display: grid;
      grid-template-columns: 10px 1fr;
      gap: 10px;
      padding: 14px 16px;
      text-align: left;
      cursor: pointer;
      color: var(--text-primary);
    }

    .notification-row:hover {
      background: var(--surface-2);
    }

    .notification-row.unread {
      background: rgba(59,130,246,0.1);
    }

    .notification-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: transparent;
      margin-top: 6px;
    }

    .notification-row.unread .notification-dot {
      background: #3B82F6;
      box-shadow: 0 0 8px #3B82F6;
    }

    .notification-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .notification-content strong {
      color: var(--text-primary);
      font-size: 0.92rem;
    }

    .notification-content small {
      color: var(--text-secondary);
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificationCenter = inject(NotificationCenterService);
  private readonly subscriptions = new Subscription();

  protected notifications: AppNotification[] = [];
  protected unreadCount = 0;
  protected notificationsOpen = false;

  readonly showNavbar = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => !this.router.url.includes('/perfil'))
    ),
    { initialValue: !this.router.url.includes('/perfil') }
  );

  ngOnInit(): void {
    this.loadNotifications();
    this.subscriptions.add(interval(30000).subscribe(() => this.loadNotifications()));
    this.notificationCenter.ensureWelcome().subscribe({
      next: () => this.loadNotifications(),
      error: () => undefined
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  login(): void {
    void this.auth.login();
  }

  logout(): void {
    void this.auth.logout();
  }

  protected toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;
    if (this.notificationsOpen) {
      this.loadNotifications();
    }
  }

  protected isUnread(notification: AppNotification): boolean {
    return isNotificationUnread(notification);
  }

  protected openNotification(notification: AppNotification): void {
    const navigate = () => {
      this.notificationsOpen = false;
      if (notification.actionUrl) {
        void this.router.navigateByUrl(notification.actionUrl);
      } else {
        this.goToNotifications();
      }
    };

    if (this.isUnread(notification)) {
      this.notificationCenter.markAsRead(notification.id).subscribe({
        next: () => {
          notification.read = true;
          notification.status = 'READ';
          this.unreadCount = Math.max(0, this.unreadCount - 1);
          navigate();
        },
        error: () => navigate()
      });
      return;
    }
    navigate();
  }

  protected markAllAsRead(): void {
    this.notificationCenter.markAllAsRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map((notification) => ({ ...notification, read: true, status: 'READ' }));
        this.unreadCount = 0;
      }
    });
  }

  protected goToNotifications(): void {
    this.notificationsOpen = false;
    void this.router.navigate(['/notificaciones']);
  }

  private loadNotifications(): void {
    if (!this.auth.isAuthenticated()) {
      this.notifications = [];
      this.unreadCount = 0;
      return;
    }

    this.notificationCenter.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.unreadCount = this.notificationCenter.unreadCountFrom(notifications);
      },
      error: () => {
        this.notifications = [];
        this.unreadCount = 0;
      }
    });
  }
}
