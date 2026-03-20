// Force environment variables BEFORE any imports that might initialize auth
process.env.BETTER_AUTH_URL = "http://localhost/api/auth";
process.env.NODE_ENV = "test";
process.env.BETTER_AUTH_SECRET = "wOMDxFn6aefAaCfvVX3go2j6ZLRCCofl";

import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { auth } from "../../../src/infrastructure/auth/auth";
import { clearDatabase } from "../IntegrationSetup";
import { db } from "../../../src/infrastructure/database/db";
import * as schema from "../../../src/infrastructure/database/schema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { hasRole, isSystemAdmin } from "../../../src/shared/middlewares/rbac";

/**
 * Helper to simulate a real session in the database
 */
async function createTestSession(userEmail: string, isSystemAdmin = false) {
  const password = "Password123!";
  
  try {
    // 1. Ensure user exists
    let [user] = await db.select().from(schema.users).where(eq(schema.users.email, userEmail)).limit(1);
    if (!user) {
        await auth.api.signUpEmail({
            body: { email: userEmail, password, name: "Test User" },
            headers: new Headers()
        });
        [user] = await db.select().from(schema.users).where(eq(schema.users.email, userEmail)).limit(1);
    }

    if (!user) throw new Error(`User creation failed for ${userEmail}`);

    // Set System Admin and verify email for testing consistency
    if (user.isSystemAdmin !== isSystemAdmin || !user.emailVerified) {
        await db.update(schema.users).set({ isSystemAdmin, emailVerified: true }).where(eq(schema.users.id, user.id));
        user.isSystemAdmin = isSystemAdmin;
        user.emailVerified = true;
    }

    // 2. Sign in to get session headers
    const result = await (auth.api.signInEmail as any)({
        body: { email: userEmail, password },
        headers: new Headers()
    });

    if (!result || !result.token) {
        console.error(`[AUTH TEST ERROR] Sign-in failed for ${userEmail}:`, result);
        throw new Error(`Failed to sign in user ${userEmail}`);
    }

    return { user, token: result.token };
  } catch (e) {
    console.error(`[AUTH TEST ERROR] Exception in createTestSession for ${userEmail}:`, e);
    throw e;
  }
}

describe("Auth & Membership Flow Integration", () => {
  beforeAll(async () => {
    await clearDatabase();
  });

  test("1. First user should be System Admin", async () => {
    const response = await auth.api.signUpEmail({
      body: {
        email: "admin@example.com",
        password: "Password123!",
        name: "Admin User",
      },
    });

    expect(response.user).toBeDefined();
    const [dbUser] = await db.select().from(schema.users).where(eq(schema.users.email, "admin@example.com")).limit(1);
    expect(dbUser?.isSystemAdmin).toBe(true);
  });

  test("2. Second user should NOT be System Admin", async () => {
    const response = await auth.api.signUpEmail({
      body: {
        email: "user@example.com",
        password: "Password123!",
        name: "Regular User",
      },
    });

    expect(response.user).toBeDefined();
    const [dbUser] = await db.select().from(schema.users).where(eq(schema.users.email, "user@example.com")).limit(1);
    expect(dbUser?.isSystemAdmin).toBe(false);
  });

  test("3. Organization creation and member role (Direct Drizzle)", async () => {
    const [user] = await db.select().from(schema.users).limit(1);
    if (!user) throw new Error("No user found");
    
    // Create Org
    const [org] = await db.insert(schema.organizations).values({
      name: "Drizzle Org",
      slug: "drizzle-org",
    }).returning();

    if (!org) throw new Error("Org creation failed");

    // Create Member
    const [member] = await db.insert(schema.members).values({
      userId: user.id,
      organizationId: org.id,
      role: "owner",
    }).returning();

    if (!member) throw new Error("Member creation failed");

    expect(org).toBeDefined();
    expect(member.role).toBe("owner");
    expect(member.userId).toBe(user.id);
  });

  describe("RBAC Middlewares (with Real Sessions)", () => {
    const app = new Hono();
    app.get("/protected/:organizationId", hasRole("admin"), (c) => c.json({ ok: true }));
    app.get("/sys-admin", isSystemAdmin, (c) => c.json({ ok: true }));

    // Clean DB before RBAC tests to guarantee isolation from other test files
    beforeAll(async () => {
      await clearDatabase();
    });

    test("4. hasRole('admin') should allow owner through header", async () => {
      const { user, token } = await createTestSession("owner@example.com");
      const [org] = await db.insert(schema.organizations).values({ name: "RBAC Org", slug: "rbac-org" }).returning();
      if (!org) throw new Error("Org creation failed");
      await db.insert(schema.members).values({ userId: user.id, organizationId: org.id, role: "owner" });

      const res = await app.request(`/protected/${org.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });
      expect(res.status).toBe(200);
    });

    test("5. hasRole('owner') should deny editor", async () => {
      const appOwner = new Hono();
      appOwner.get("/owner-only", hasRole("owner"), (c) => c.json({ ok: true }));

      const { user, token } = await createTestSession("editor@example.com");
      const [org] = await db.insert(schema.organizations).values({ name: "Editor Org", slug: "editor-org" }).returning();
      if (!org) throw new Error("Org creation failed");
      await db.insert(schema.members).values({ userId: user.id, organizationId: org.id, role: "editor" });

      const res = await appOwner.request("/owner-only", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "X-Organization-Id": org.id,
        }
      });
      expect(res.status).toBe(403);
      const body = await res.json() as any;
      expect(body.error).toContain("owner required");
    });

    test("6. isSystemAdmin middleware should allow sysadmin", async () => {
      const { token } = await createTestSession("sysadmin@example.com", true);

      const res = await app.request("/sys-admin", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      expect(res.status).toBe(200);
    });

    test("7. isSystemAdmin middleware should deny regular user", async () => {
        const { token } = await createTestSession("random@example.com", false);
  
        const res = await app.request("/sys-admin", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        expect(res.status).toBe(403);
      });
  });
});

