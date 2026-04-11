import type { Notification } from '../entities/Notification';

export interface INotificationRepository {
  save(notification: Notification): Promise<void>;
  findByUser(userId: string, options?: { limit?: number; offset?: number }): Promise<Notification[]>;
  countUnread(userId: string): Promise<number>;
  markAsRead(id: string, userId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
}
