import { expect, describe, it, beforeAll, afterAll, beforeEach, spyOn } from "bun:test";
import { OpenAPIHono } from "@hono/zod-openapi";
import { adminRouter } from "../../../src/interface/routes/admin";
import { auth } from "../../../src/infrastructure/auth/auth";
import { testDb, clearDatabase } from "../IntegrationSetup";

import * as schema from "../../../src/infrastructure/database/schema";

describe("Admin Users API Flow", () => {
  const app = new OpenAPIHono();
  
  app.onError((err, c) => {
    console.error("Test App Error:", err);
    return c.json({ error: err.message }, 500);
  });

  app.route("/api/v1/admin", adminRouter);

  const getSessionSpy = spyOn(auth.api, "getSession") as any;

  beforeAll(async () => {
    await clearDatabase();
  });

  afterAll(() => {
    getSessionSpy.mockRestore();
  });

  it("should list all users when authorized as System Admin", async () => {
    // 1. Arrange: Seed database with users
    const adminId = crypto.randomUUID();
    const userId = crypto.randomUUID();
    await testDb.insert(schema.users).values([
      { id: adminId, email: "admin@test.com", name: "Admin", isSystemAdmin: true, emailVerified: true },
      { id: userId, email: "user@test.com", name: "User", isSystemAdmin: false, emailVerified: true },
    ]);

    // 2. Mock Session as Admin
    getSessionSpy.mockImplementation((async () => ({
      user: { id: adminId, isSystemAdmin: true },
      session: { id: crypto.randomUUID(), userId: adminId, expiresAt: new Date(Date.now() + 100000) }
    })) as any);

    // 3. Act
    const res = await app.request("/api/v1/admin/users");

    // 4. Assert
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.users).toHaveLength(2);
    expect(body.users.find((u: any) => u.email === "user@test.com")).toBeDefined();
    expect(body._metadata.message).toBe("Successfully retrieved all users via Use Case");
  });

  it("should return 403 when user is NOT a System Admin", async () => {
    // Arrange: Mock Session as Regular User
    const userId = crypto.randomUUID();
    getSessionSpy.mockImplementation((async () => ({
      user: { id: userId, isSystemAdmin: false },
      session: { id: crypto.randomUUID(), userId: userId, expiresAt: new Date(Date.now() + 100000) }
    })) as any);

    // Act
    const res = await app.request("/api/v1/admin/users");

    // Assert
    expect(res.status).toBe(403);
    const body = await res.json() as any;
    expect(body.error).toBe("Unauthorized: System Admin only");
  });

  it("should return 403 when no session is present", async () => {
    // Arrange: Mock No Session
    getSessionSpy.mockImplementation((async () => null) as any);

    // Act
    const res = await app.request("/api/v1/admin/users");

    // Assert
    expect(res.status).toBe(403);
  });
});
