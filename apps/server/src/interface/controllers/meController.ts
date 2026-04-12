import type { Context } from 'hono';
import { auth } from '../../infrastructure/auth/auth';
import { container } from '../../infrastructure/container';

export const meController = {
  /**
   * Return the current user's session and profile information.
   * Assumes the session has already been verified by a middleware.
   */
  getMe: async (c: Context) => {
    // We re-fetch session just in case, or use the one from context if available
    const session = c.get("session") || await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Enrich user with notification prefs from DB (not stored in session)
    const dbUser = await container.userRepository.findById(session.user.id);
    const notificationPrefs = dbUser?.getNotificationPrefs() ?? { newReview: true, weeklyReport: true };

    return c.json({
      user: { ...session.user, notificationPrefs },
      session: session.session
    }, 200);
  },

  updateMe: async (c: Context) => {
    const session = c.get("session") || await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { name, email, avatarUrl, notificationPrefs } = await c.req.json();

    try {
      await container.updateUserUseCase.execute({
        id: session.user.id,
        name,
        email,
        avatarUrl,
        notificationPrefs
      });
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ error: err.message }, 400);
    }
  }
};
