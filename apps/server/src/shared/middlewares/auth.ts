import type { Context, Next } from "hono";
import { auth } from "../../infrastructure/auth/auth";

/**
 * Middleware to verify if the user is authenticated (has a valid session).
 * Returns 401 Unauthorized if no session is found.
 */
export const isAuthenticated = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  
  if (!session) {
    return c.json({ error: "Unauthorized: Valid session required" }, 401);
  }
  
  // Store session in context for downstream handlers if needed
  c.set("session", session);
  
  await next();
};
