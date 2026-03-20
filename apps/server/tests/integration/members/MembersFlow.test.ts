import { expect, it, describe, spyOn, beforeAll, afterEach, afterAll } from "bun:test";
import { OpenAPIHono } from "@hono/zod-openapi";
import { orgRouter } from "../../../src/interface/routes/organizations";
import { auth } from "../../../src/infrastructure/auth/auth";
import { db } from "../../../src/infrastructure/database/db";
import { testDb, clearDatabase } from "../IntegrationSetup";
import * as schema from "../../../src/infrastructure/database/schema";

// ─── Constants ──────────────────────────────────────────────────────────────
const ORG_ID = crypto.randomUUID();
const OWNER_ID = crypto.randomUUID();
const VIEWER_ID = crypto.randomUUID();
const VIEWER_MEMBER_ID = crypto.randomUUID();

// ─── Hono app under test ────────────────────────────────────────────────────
const app = new OpenAPIHono();
app.route("/api/v1/organizations", orgRouter);

// ─── Spies ──────────────────────────────────────────────────────────────────
const getSessionSpy = spyOn(auth.api, "getSession") as any;
const createInvitationSpy = spyOn(auth.api, "createInvitation") as any;
const removeMemberSpy = spyOn(auth.api, "removeMember") as any;
const updateMemberRoleSpy = spyOn(auth.api, "updateMemberRole") as any;

// ─── Helpers ────────────────────────────────────────────────────────────────
function mockSession(userId: string, isSystemAdmin = false) {
  getSessionSpy.mockImplementation((async () => ({
    user: { id: userId, isSystemAdmin },
    session: {
      id: crypto.randomUUID(),
      userId,
      expiresAt: new Date(Date.now() + 100_000),
      token: "test-token",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })) as any);
}

function mockDbMember(role: string | null) {
  return spyOn(db, "select").mockImplementation(() => ({
    from: () => ({
      where: () => ({
        limit: () => Promise.resolve(role ? [{ role }] : []),
      }),
    }),
  }) as any);
}

// ═════════════════════════════════════════════════════════════════════════════
describe("Members API Flow", () => {

  // ─── Seed shared data ───────────────────────────────────────────────────
  beforeAll(async () => {
    await clearDatabase();

    // 2 users
    await testDb.insert(schema.users).values([
      { id: OWNER_ID, email: "owner@test.com", name: "Owner", emailVerified: true },
      { id: VIEWER_ID, email: "viewer@test.com", name: "Viewer", emailVerified: true },
    ]);

    // 1 organization
    await testDb.insert(schema.organizations).values({
      id: ORG_ID, name: "Acme", slug: "acme",
    });

    // 2 members: owner + viewer
    await testDb.insert(schema.members).values([
      { id: crypto.randomUUID(), userId: OWNER_ID, organizationId: ORG_ID, role: "owner" },
      { id: VIEWER_MEMBER_ID, userId: VIEWER_ID, organizationId: ORG_ID, role: "viewer" },
    ]);
  });

  afterEach(() => {
    getSessionSpy.mockReset();
    createInvitationSpy.mockReset();
    removeMemberSpy.mockReset();
    updateMemberRoleSpy.mockReset();
  });

  afterAll(() => {
    getSessionSpy.mockRestore();
    createInvitationSpy.mockRestore();
    removeMemberSpy.mockRestore();
    updateMemberRoleSpy.mockRestore();
  });

  // ═══════════════════════════════════════════════════════════════════════
  // GET /api/v1/organizations/:orgId/members
  // ═══════════════════════════════════════════════════════════════════════
  describe("GET /members", () => {
    it("Without session → 401", async () => {
      getSessionSpy.mockImplementation((async () => null) as any);

      const res = await app.request(`/api/v1/organizations/${ORG_ID}/members`);
      expect(res.status).toBe(401);
    });

    it("With viewer session → 200 + returns members list", async () => {
      mockSession(VIEWER_ID);

      // db.select is called twice:
      //   1st: RBAC middleware checks membership → returns [{role: "viewer"}]
      //   2nd: DrizzleMemberRepository lists members → returns full member list
      let callCount = 0;
      const dbSpy = spyOn(db, "select").mockImplementation((...args: any[]) => {
        callCount++;
        if (callCount === 1) {
          // RBAC check
          return {
            from: () => ({
              where: () => ({
                limit: () => Promise.resolve([{ role: "viewer" }]),
              }),
            }),
          } as any;
        }
        // ListMembersUseCase query (innerJoin)
        return {
          from: () => ({
            innerJoin: () => ({
              where: () => Promise.resolve([
                { id: crypto.randomUUID(), role: "owner", userId: OWNER_ID, userName: "Owner", userEmail: "owner@test.com", createdAt: new Date() },
                { id: VIEWER_MEMBER_ID, role: "viewer", userId: VIEWER_ID, userName: "Viewer", userEmail: "viewer@test.com", createdAt: new Date() },
              ]),
            }),
          }),
        } as any;
      });

      const res = await app.request(`/api/v1/organizations/${ORG_ID}/members`);
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.members).toBeArray();
      expect(body.members.length).toBe(2);

      const emails = body.members.map((m: any) => m.userEmail).sort();
      expect(emails).toEqual(["owner@test.com", "viewer@test.com"]);

      dbSpy.mockRestore();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // POST /api/v1/organizations/:orgId/members/invite
  // ═══════════════════════════════════════════════════════════════════════
  describe("POST /members/invite", () => {
    it("With viewer session → 403", async () => {
      mockSession(VIEWER_ID);
      const dbSpy = mockDbMember("viewer");

      const res = await app.request(`/api/v1/organizations/${ORG_ID}/members/invite`, {
        method: "POST",
        body: JSON.stringify({ email: "new@user.com", role: "editor" }),
        headers: { "Content-Type": "application/json" },
      });

      expect(res.status).toBe(403);
      dbSpy.mockRestore();
    });

    it("With admin session → 201 + invitation created", async () => {
      mockSession(OWNER_ID);
      const dbSpy = mockDbMember("admin");

      // Mock the better-auth createInvitation call made by InviteMemberUseCase
      createInvitationSpy.mockImplementation(async () => ({
        id: crypto.randomUUID(),
        email: "new@user.com",
        role: "editor",
        organizationId: ORG_ID,
        status: "pending",
      }));

      const res = await app.request(`/api/v1/organizations/${ORG_ID}/members/invite`, {
        method: "POST",
        body: JSON.stringify({ email: "new@user.com", role: "editor" }),
        headers: { "Content-Type": "application/json" },
      });

      expect(res.status).toBe(201);
      const body = await res.json() as any;
      expect(body.invitation).toBeDefined();
      expect(body.invitation.email).toBe("new@user.com");

      dbSpy.mockRestore();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // PATCH /api/v1/organizations/:orgId/members/:memberId/role
  // ═══════════════════════════════════════════════════════════════════════
  describe("PATCH /members/:memberId/role", () => {
    it("With admin session → 403 (only owner can change roles)", async () => {
      mockSession(OWNER_ID);
      const dbSpy = mockDbMember("admin");

      const res = await app.request(
        `/api/v1/organizations/${ORG_ID}/members/${VIEWER_MEMBER_ID}/role`,
        {
          method: "PATCH",
          body: JSON.stringify({ role: "editor" }),
          headers: { "Content-Type": "application/json" },
        }
      );

      expect(res.status).toBe(403);
      dbSpy.mockRestore();
    });

    it("With owner session → 200", async () => {
      mockSession(OWNER_ID);
      const dbSpy = mockDbMember("owner");

      // Mock better-auth updateMemberRole
      updateMemberRoleSpy.mockImplementation(async () => ({
        id: VIEWER_MEMBER_ID,
        role: "editor",
        organizationId: ORG_ID,
      }));

      const res = await app.request(
        `/api/v1/organizations/${ORG_ID}/members/${VIEWER_MEMBER_ID}/role`,
        {
          method: "PATCH",
          body: JSON.stringify({ role: "editor" }),
          headers: { "Content-Type": "application/json" },
        }
      );

      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.member).toBeDefined();

      dbSpy.mockRestore();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // DELETE /api/v1/organizations/:orgId/members/:memberId
  // ═══════════════════════════════════════════════════════════════════════
  describe("DELETE /members/:memberId", () => {
    it("With viewer session → 403", async () => {
      mockSession(VIEWER_ID);
      const dbSpy = mockDbMember("viewer");

      const res = await app.request(
        `/api/v1/organizations/${ORG_ID}/members/${VIEWER_MEMBER_ID}`,
        { method: "DELETE" }
      );

      expect(res.status).toBe(403);
      dbSpy.mockRestore();
    });

    it("With admin session → 200", async () => {
      mockSession(OWNER_ID);
      const dbSpy = mockDbMember("admin");

      // Mock better-auth removeMember
      removeMemberSpy.mockImplementation(async () => ({
        success: true,
      }));

      const res = await app.request(
        `/api/v1/organizations/${ORG_ID}/members/${VIEWER_MEMBER_ID}`,
        { method: "DELETE" }
      );

      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.message).toContain("removed");

      dbSpy.mockRestore();
    });
  });
});
