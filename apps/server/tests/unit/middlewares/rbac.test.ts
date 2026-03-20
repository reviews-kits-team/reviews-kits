import { expect, test, describe, spyOn, afterEach, afterAll } from "bun:test";
import { Hono } from "hono";
import { isSystemAdmin, hasRole } from "../../../src/shared/middlewares/rbac";
import { auth } from "../../../src/infrastructure/auth/auth";
import { db } from "../../../src/infrastructure/database/db";

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

// ─── Helper: mock db.select() chain ─────────────────────────────────────────
function mockDbMember(role: string | null) {
  return spyOn(db, "select").mockImplementation(() => ({
    from: () => ({
      where: () => ({
        limit: () => Promise.resolve(role ? [{ role }] : []),
      }),
    }),
  }) as any);
}

// ─── Shared Hono apps for middleware tests ──────────────────────────────────
const adminApp = new Hono();
adminApp.use("*", isSystemAdmin);
adminApp.get("/admin", (c) => c.json({ ok: true }));

const roleApp = new Hono();
roleApp.use("/:organizationId/*", hasRole("admin"));
roleApp.get("/:organizationId/resource", (c) => c.json({ ok: true }));

// ─── Global spy ─────────────────────────────────────────────────────────────
const getSessionSpy = spyOn(auth.api, "getSession") as any;

afterEach(() => {
  getSessionSpy.mockReset();
});

afterAll(() => {
  getSessionSpy.mockRestore();
});

// ═════════════════════════════════════════════════════════════════════════════
// 1. roleHierarchy
// ═════════════════════════════════════════════════════════════════════════════
describe("roleHierarchy", () => {
  test("owner > admin > editor > viewer", async () => {
    // We verify the hierarchy indirectly: an owner should pass a check
    // requiring "admin", but a viewer should not, etc.
    // Build a Hono app with hasRole("admin") to probe each level.

    const probeApp = new Hono();
    probeApp.use("/:organizationId/*", hasRole("admin"));
    probeApp.get("/:organizationId/x", (c) => c.json({ ok: true }));

    const roles = ["owner", "admin", "editor", "viewer"] as const;
    const expected = [200, 200, 403, 403]; // owner & admin pass, editor & viewer fail

    for (let i = 0; i < roles.length; i++) {
      getSessionSpy.mockImplementation((async () => mockSession()) as any);
      const dbSpy = mockDbMember(roles[i]!);

      const res = await probeApp.request("/org-1/x");
      expect(res.status).toBe(expected[i]!);

      dbSpy.mockRestore();
      getSessionSpy.mockReset();
    }
  });

  test("hierarchy levels are strictly ordered: owner(4) > admin(3) > editor(2) > viewer(1)", async () => {
    // Test each role against hasRole("editor") — owner, admin, editor pass; viewer fails
    const probeApp = new Hono();
    probeApp.use("/:organizationId/*", hasRole("editor"));
    probeApp.get("/:organizationId/x", (c) => c.json({ ok: true }));

    const roles = ["owner", "admin", "editor", "viewer"] as const;
    const expected = [200, 200, 200, 403];

    for (let i = 0; i < roles.length; i++) {
      getSessionSpy.mockImplementation((async () => mockSession()) as any);
      const dbSpy = mockDbMember(roles[i]!);

      const res = await probeApp.request("/org-1/x");
      expect(res.status).toBe(expected[i]!);

      dbSpy.mockRestore();
      getSessionSpy.mockReset();
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. hasRole("admin") middleware
// ═════════════════════════════════════════════════════════════════════════════
describe('hasRole("admin") middleware', () => {
  test("Unauthenticated user → 401", async () => {
    getSessionSpy.mockImplementation((async () => null) as any);

    const res = await roleApp.request("/org-1/resource");
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  test("Viewer user → 403", async () => {
    getSessionSpy.mockImplementation((async () => mockSession()) as any);
    const dbSpy = mockDbMember("viewer");

    const res = await roleApp.request("/org-1/resource");
    expect(res.status).toBe(403);
    expect((await res.json() as ErrorResponse).error).toContain("Min role admin required");

    dbSpy.mockRestore();
  });

  test("Editor user → 403", async () => {
    getSessionSpy.mockImplementation((async () => mockSession()) as any);
    const dbSpy = mockDbMember("editor");

    const res = await roleApp.request("/org-1/resource");
    expect(res.status).toBe(403);
    expect((await res.json() as ErrorResponse).error).toContain("Min role admin required");

    dbSpy.mockRestore();
  });

  test("Admin user → 200", async () => {
    getSessionSpy.mockImplementation((async () => mockSession()) as any);
    const dbSpy = mockDbMember("admin");

    const res = await roleApp.request("/org-1/resource");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    dbSpy.mockRestore();
  });

  test("Owner user → 200", async () => {
    getSessionSpy.mockImplementation((async () => mockSession()) as any);
    const dbSpy = mockDbMember("owner");

    const res = await roleApp.request("/org-1/resource");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    dbSpy.mockRestore();
  });

  test("isSystemAdmin user → 200 (bypass)", async () => {
    getSessionSpy.mockImplementation(
      (async () => mockSession({ isSystemAdmin: true })) as any
    );
    // No DB spy needed — system admin bypasses the DB membership check

    const res = await roleApp.request("/org-1/resource");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  test("Non-member of the organization → 403", async () => {
    getSessionSpy.mockImplementation((async () => mockSession()) as any);
    const dbSpy = mockDbMember(null); // no membership found

    const res = await roleApp.request("/org-1/resource");
    expect(res.status).toBe(403);
    expect((await res.json() as ErrorResponse).error).toContain("Not a member");

    dbSpy.mockRestore();
  });

  test("Missing organizationId → 400", async () => {
    // Build a special app without :organizationId param in the path
    const noOrgApp = new Hono();
    noOrgApp.use("*", hasRole("admin"));
    noOrgApp.get("/resource", (c) => c.json({ ok: true }));

    getSessionSpy.mockImplementation((async () => mockSession()) as any);

    const res = await noOrgApp.request("/resource");
    expect(res.status).toBe(400);
    expect((await res.json() as ErrorResponse).error).toContain("Missing Organization ID");
  });
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
