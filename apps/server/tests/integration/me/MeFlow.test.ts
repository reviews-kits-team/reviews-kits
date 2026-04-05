import { expect, it, describe, spyOn, afterAll, beforeEach } from "bun:test";
import { OpenAPIHono } from "@hono/zod-openapi";
import { meRouter } from "../../../src/interface/routes/me";
import { auth } from "../../../src/infrastructure/auth/auth";
import { testDb, clearDatabase } from "../IntegrationSetup";
import { sql } from "drizzle-orm";

describe("Me API Flow", () => {
  const app = new OpenAPIHono();
  app.route("/api/v1/me", meRouter);

  const getSessionSpy = spyOn(auth.api, "getSession") as any;

  afterAll(() => {
    getSessionSpy.mockRestore();
  });

  beforeEach(async () => {
      await clearDatabase();
      await testDb.execute(sql.raw(`INSERT INTO "users" (id, name, email) VALUES ('11111111-1111-1111-1111-111111111111', 'Test User', 'test@example.com') ON CONFLICT DO NOTHING`));
  });

  it("should return user and session when authenticated", async () => {
    // 1. Mock Session
    const mockUser = { 
        id: "11111111-1111-1111-1111-111111111111", 
        email: "test@example.com", 
        name: "Test User", 
        isSystemAdmin: false,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    const mockSession = { 
        id: "22222222-2222-2222-2222-222222222222", 
        userId: "11111111-1111-1111-1111-111111111111", 
        expiresAt: new Date(Date.now() + 100000),
        createdAt: new Date(),
        updatedAt: new Date()
    };

    getSessionSpy.mockImplementation((async () => ({
      user: mockUser,
      session: mockSession
    })) as any);

    // 2. Act
    const res = await app.request("/api/v1/me");

    // 3. Assert
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.user.id).toBe("11111111-1111-1111-1111-111111111111");
    expect(body.user.email).toBe("test@example.com");
    expect(body.session.id).toBe("22222222-2222-2222-2222-222222222222");
  });

  it("should return 401 when NOT authenticated", async () => {
    // 1. Mock No Session
    getSessionSpy.mockImplementation((async () => null) as any);

    // 2. Act
    const res = await app.request("/api/v1/me");

    // 3. Assert
    expect(res.status).toBe(401);
    const body = await res.json() as any;
    expect(body.error).toBe("Unauthorized: Valid session required");
  });

  it("should update user profile info", async () => {
    // 1. Mock Session
    const mockUser = { id: "11111111-1111-1111-1111-111111111111", email: "test@example.com", name: "Old Name" };
    getSessionSpy.mockImplementation((async () => ({
      user: mockUser,
      session: { id: "22222222-2222-2222-2222-222222222222", userId: "11111111-1111-1111-1111-111111111111" }
    })) as any);

    // 2. Act
    const res = await app.request("/api/v1/me", {
      method: "PATCH",
      body: JSON.stringify({ name: "New Name", avatarUrl: "https://avatar.com/123" }),
      headers: { "Content-Type": "application/json" }
    });

    // 3. Assert
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
  });
});
