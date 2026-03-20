import { expect, test, describe, spyOn, afterEach, afterAll } from "bun:test";
import { Hono } from "hono";
import { isSystemAdmin, hasRole } from "../../../src/shared/middlewares/rbac";
import { auth } from "../../../src/infrastructure/auth/auth";
import { db } from "../../../src/infrastructure/database/db";

describe("RBAC Route Protection - Exhaustive Integration", () => {
  const app = new Hono();

  // Mock routes exactly like in index.ts
  const adminGroup = new Hono();
  adminGroup.use("*", isSystemAdmin);
  adminGroup.get("/users", (c) => c.json({ users: ["user1", "user2"] }));
  app.route("/api/v1/admin", adminGroup);

  const orgGroup = new Hono();
  orgGroup.use("/:organizationId/*", hasRole("viewer"));
  orgGroup.get("/:organizationId/projects", (c) => c.json({ projects: ["p1"] }));
  app.route("/api/v1/organizations", orgGroup);

  const getSessionSpy = spyOn(auth.api, "getSession") as any;

  afterEach(() => {
    getSessionSpy.mockReset();
  });

  afterAll(() => {
    getSessionSpy.mockRestore();
  });

  describe("System Admin access", () => {
    test("Favorable: System Admin should access admin routes", async () => {
      getSessionSpy.mockImplementation((async () => ({
        user: { id: "admin-id", isSystemAdmin: true },
        session: { id: "s1", userId: "admin-id", expiresAt: new Date(), token: "t1", createdAt: new Date(), updatedAt: new Date() }
      })) as any);

      const res = await app.request("/api/v1/admin/users");
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ users: ["user1", "user2"] });
    });

    test("Favorable: System Admin should access any organization routes", async () => {
      getSessionSpy.mockImplementation((async () => ({
        user: { id: "admin-id", isSystemAdmin: true },
        session: { id: "s1", userId: "admin-id", expiresAt: new Date(), token: "t1", createdAt: new Date(), updatedAt: new Date() }
      })) as any);

      const res = await app.request("/api/v1/organizations/any-org/projects");
      expect(res.status).toBe(200);
    });
  });

  describe("Regular Member access", () => {
    test("Unfavorable: Regular user should NOT access admin routes", async () => {
      getSessionSpy.mockImplementation((async () => ({
        user: { id: "user-id", isSystemAdmin: false },
        session: { id: "s2", userId: "user-id", expiresAt: new Date(), token: "t2", createdAt: new Date(), updatedAt: new Date() }
      })) as any);

      const res = await app.request("/api/v1/admin/users");
      expect(res.status).toBe(403);
    });

    test("Favorable: Regular user should access their own organization", async () => {
      getSessionSpy.mockImplementation((async () => ({
        user: { id: "user-id", isSystemAdmin: false },
        session: { id: "s2", userId: "user-id", expiresAt: new Date(), token: "t2", createdAt: new Date(), updatedAt: new Date() }
      })) as any);

      // Mock database response for membership
      const dbSpy = spyOn(db, "select").mockImplementation(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([{ role: "viewer" }])
          })
        })
      }) as any);

      const res = await app.request("/api/v1/organizations/org-123/projects");
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ projects: ["p1"] });

      dbSpy.mockRestore();
    });

    test("Unfavorable: Regular user should NOT access organization they aren't member of", async () => {
      getSessionSpy.mockImplementation((async () => ({
        user: { id: "user-id", isSystemAdmin: false },
        session: { id: "s2", userId: "user-id", expiresAt: new Date(), token: "t2", createdAt: new Date(), updatedAt: new Date() }
      })) as any);

      // Mock database response as empty (not a member)
      const dbSpy = spyOn(db, "select").mockImplementation(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([])
          })
        })
      }) as any);

      const res = await app.request("/api/v1/organizations/other-org/projects");
      expect(res.status).toBe(403);

      dbSpy.mockRestore();
    });
  });

  describe("Anonymous access", () => {
    test("Unfavorable: Visitor without session should be blocked (403 for admin, 401 for org)", async () => {
      getSessionSpy.mockImplementation((async () => null) as any);

      const resAdmin = await app.request("/api/v1/admin/users");
      expect(resAdmin.status).toBe(403);

      const resOrg = await app.request("/api/v1/organizations/org-id/projects");
      expect(resOrg.status).toBe(401);
    });
  });
});
