import { expect, it, describe, spyOn, beforeEach, afterEach, afterAll, beforeAll } from "bun:test";
import { OpenAPIHono } from "@hono/zod-openapi";
import { meRouter } from "../../../src/interface/routes/me";
import { auth } from "../../../src/infrastructure/auth/auth";

describe("Me API Flow", () => {
  const app = new OpenAPIHono();
  app.route("/api/v1/me", meRouter);

  const getSessionSpy = spyOn(auth.api, "getSession") as any;

  afterAll(() => {
    getSessionSpy.mockRestore();
  });

  it("should return user and session when authenticated", async () => {
    // 1. Mock Session
    const mockUser = { 
        id: "u1", 
        email: "test@example.com", 
        name: "Test User", 
        isSystemAdmin: false,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    const mockSession = { 
        id: "s1", 
        userId: "u1", 
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
    expect(body.user.id).toBe("u1");
    expect(body.user.email).toBe("test@example.com");
    expect(body.session.id).toBe("s1");
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
});
