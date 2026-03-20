import { expect, test, describe, spyOn, afterEach, afterAll } from "bun:test";
import { Hono } from "hono";
import { isSystemAdmin } from "../../../src/shared/middlewares/rbac";
import { auth } from "../../../src/infrastructure/auth/auth";

describe("RBAC Route Protection - Exhaustive Integration", () => {
  const app = new Hono();

  // Mock routes exactly like in index.ts
  const adminGroup = new Hono();
  adminGroup.use("*", isSystemAdmin);
  adminGroup.get("/users", (c) => c.json({ users: ["user1", "user2"] }));
  app.route("/api/v1/admin", adminGroup);

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
  });

  describe("Anonymous access", () => {
    test("Unfavorable: Visitor without session should be blocked from admin routes", async () => {
      getSessionSpy.mockImplementation((async () => null) as any);

      const resAdmin = await app.request("/api/v1/admin/users");
      expect(resAdmin.status).toBe(403);
    });
  });
});
