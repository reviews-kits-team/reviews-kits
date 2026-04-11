import type { Context } from 'hono';
import { auth } from '../../infrastructure/auth/auth';
import { container } from '../../infrastructure/container';

export const notificationController = {
  list: async (c: Context) => {
    const session = c.get("session") || await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user?.id) return c.json({ error: "Unauthorized" }, 401);

    const limit = Number(c.req.query('limit')) || 20;
    const offset = Number(c.req.query('offset')) || 0;

    const [notifications, unreadCount] = await Promise.all([
      container.notificationRepository.findByUser(session.user.id, { limit, offset }),
      container.notificationRepository.countUnread(session.user.id),
    ]);

    return c.json({
      notifications: notifications.map(n => n.getProps()),
      unreadCount,
    });
  },

  markRead: async (c: Context) => {
    const session = c.get("session") || await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user?.id) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param('id') as string;
    await container.notificationRepository.markAsRead(id, session.user.id);
    return c.json({ success: true });
  },

  markAllRead: async (c: Context) => {
    const session = c.get("session") || await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user?.id) return c.json({ error: "Unauthorized" }, 401);

    await container.notificationRepository.markAllAsRead(session.user.id);
    return c.json({ success: true });
  },
};
