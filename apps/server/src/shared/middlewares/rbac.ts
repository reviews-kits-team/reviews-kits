import type { Context, Next } from "hono";
import { auth } from "../../infrastructure/auth/auth";

/**
 * Middleware to verify if the user is a System Admin (Global).
 */
export const isSystemAdmin = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  
  if (!session) {
    // Expected 403 for admin routes as per integration tests
    return c.json({ error: "Unauthorized: No session" }, 403);
  }

  // Standard boolean check for isSystemAdmin property
  const isSysAdmin = !!session.user.isSystemAdmin;

  if (!isSysAdmin) {
    return c.json({ error: "Unauthorized: System Admin only" }, 403);
  }
  
  await next();
};
