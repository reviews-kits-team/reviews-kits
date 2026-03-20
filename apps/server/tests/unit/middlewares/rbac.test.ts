import { expect, test, describe, spyOn, afterEach, afterAll } from "bun:test";
import { Hono } from "hono";
import { isSystemAdmin } from "../../../src/shared/middlewares/rbac";
import { auth } from "../../../src/infrastructure/auth/auth";

type ErrorResponse = { error: string };

// ─── Helper: mock session factory ───────────────────────────────────────────
function mockSession(overrides: {
  userId?: string;
  isSystemAdmin?: boolean | number | string;
} = {}) {
  return {
    user: { id: overrides.userId ?? "user-1", isSystemAdmin: overrides.isSystemAdmin ?? false },
    session: {
      id: "s1",
      userId: overrides.userId ?? "user-1",
      expiresAt: new Date(),
      token: "t1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
}

// ─── Shared Hono apps for middleware tests ──────────────────────────────────
const adminApp = new Hono();
adminApp.use("*", isSystemAdmin);
adminApp.get("/admin", (c) => c.json({ ok: true }));

// ─── Global spy ─────────────────────────────────────────────────────────────
const getSessionSpy = spyOn(auth.api, "getSession") as any;

afterEach(() => {
  getSessionSpy.mockReset();
});

afterAll(() => {
  getSessionSpy.mockRestore();
});

// ═════════════════════════════════════════════════════════════════════════════
// 3. isSystemAdmin middleware
// ═════════════════════════════════════════════════════════════════════════════
describe("isSystemAdmin middleware", () => {
  test("Unauthenticated user → 403", async () => {
    getSessionSpy.mockImplementation((async () => null) as any);

    const res = await adminApp.request("/admin");
    expect(res.status).toBe(403);
    expect((await res.json() as ErrorResponse).error).toContain("No session");
  });

  test("User with isSystemAdmin = false → 403", async () => {
    getSessionSpy.mockImplementation(
      (async () => mockSession({ isSystemAdmin: false })) as any
    );

    const res = await adminApp.request("/admin");
    expect(res.status).toBe(403);
    expect((await res.json() as ErrorResponse).error).toContain("System Admin only");
  });

  test("User with isSystemAdmin = true → passes to next()", async () => {
    getSessionSpy.mockImplementation(
      (async () => mockSession({ isSystemAdmin: true })) as any
    );

    const res = await adminApp.request("/admin");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  test("isSystemAdmin = 1 (integer coercion) → passes", async () => {
    getSessionSpy.mockImplementation(
      (async () => mockSession({ isSystemAdmin: 1 })) as any
    );

    const res = await adminApp.request("/admin");
    expect(res.status).toBe(200);
  });

  test('isSystemAdmin = "true" (string coercion) → passes', async () => {
    getSessionSpy.mockImplementation(
      (async () => mockSession({ isSystemAdmin: "true" })) as any
    );

    const res = await adminApp.request("/admin");
    expect(res.status).toBe(200);
  });
});
