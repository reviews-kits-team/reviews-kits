import type { Context, Next } from "hono";
import { auth } from "../../infrastructure/auth/auth";
import { db } from "../../infrastructure/database/db";
import { members } from "../../infrastructure/database/schema";
import { and, eq } from "drizzle-orm";

export type Role = "owner" | "admin" | "editor" | "viewer";

const roleHierarchy: Record<Role, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

/**
 * Middleware to verify if the user is a System Admin (Global).
 */
export const isSystemAdmin = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  
  if (!session) {
    // Expected 403 for admin routes as per integration tests
    return c.json({ error: "Unauthorized: No session" }, 403);
  }

  // Robust check for isSystemAdmin property
  const isSysAdmin = (session.user as any).isSystemAdmin === true || (session.user as any).isSystemAdmin === 1 || (session.user as any).isSystemAdmin === "true";

  if (!isSysAdmin) {
    return c.json({ error: "Unauthorized: System Admin only" }, 403);
  }
  
  await next();
};

/**
 * Middleware to verify if the user has a specific minimum role in the current organization.
 * Expects organizationId in the path params or as a header.
 */
export const hasRole = (minRole: Role) => {
  return async (c: Context, next: Next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Bypass check for System Admin
    const isSysAdmin = (session.user as any).isSystemAdmin === true || (session.user as any).isSystemAdmin === 1 || (session.user as any).isSystemAdmin === "true";
    if (isSysAdmin) {
       return await next();
    }

    const organizationId = c.req.param("organizationId") || c.req.header("X-Organization-Id");
    
    if (!organizationId) {
      return c.json({ error: "Missing Organization ID" }, 400);
    }

    // Get active member for this organization from DB as fallback for API type issues
    const [member] = await db
      .select()
      .from(members)
      .where(
        and(
          eq(members.userId, session.user.id),
          eq(members.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!member || !member.role) {
      return c.json({ error: "Forbidden: Not a member of this organization" }, 403);
    }

    const currentRoleLevel = roleHierarchy[member.role as Role] || 0;
    const requiredRoleLevel = roleHierarchy[minRole];

    if (currentRoleLevel < requiredRoleLevel) {
      return c.json({ error: `Forbidden: Min role ${minRole} required` }, 403);
    }

    await next();
  };
};
