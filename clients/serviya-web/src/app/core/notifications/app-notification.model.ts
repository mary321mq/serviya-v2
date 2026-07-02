export interface AppNotification {
  id: number;
  receiverId?: string;
  title: string;
  message: string;
  type?: string;
  channel?: string;
  correlationId?: string | null;
  actionUrl?: string | null;
  read?: boolean;
  isRead?: boolean;
  status?: 'UNREAD' | 'READ' | string;
  createdAt: string;
}

export function isNotificationUnread(notification: AppNotification): boolean {
  if (typeof notification.read === 'boolean') {
    return !notification.read;
  }
  if (typeof notification.isRead === 'boolean') {
    return !notification.isRead;
  }
  return notification.status === 'UNREAD';
}
