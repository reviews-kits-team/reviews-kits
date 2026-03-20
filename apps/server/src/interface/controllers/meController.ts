import type { Context } from 'hono';
import { auth } from '../../infrastructure/auth/auth';

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
    
    return c.json({
      user: session.user,
      session: session.session
    }, 200 as const);
  }
};
