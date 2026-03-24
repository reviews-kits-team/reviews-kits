import { describe, expect, it, beforeAll, afterAll, beforeEach, spyOn } from "bun:test";
import { testDb, clearDatabase } from "../IntegrationSetup";
import { formsRouter } from "../../../src/interface/routes/forms";
import { auth } from "../../../src/infrastructure/auth/auth";
import { sql } from "drizzle-orm";

describe("Forms Integration Suite", () => {
  const userId = "00000000-0000-0000-0000-000000000001";
  const getSessionSpy = spyOn(auth.api, "getSession") as any;

  beforeAll(async () => {
    await clearDatabase();
  });

  afterAll(() => {
    getSessionSpy.mockRestore();
  });

  describe("Forms Creation & Listing", () => {
    beforeEach(async () => {
      await clearDatabase();
      getSessionSpy.mockReset();
      getSessionSpy.mockImplementation(async () => ({
        user: { id: userId, email: "test@example.com" },
        session: { userId }
      }));
      await testDb.execute(sql.raw(`INSERT INTO "users" (id, name, email) VALUES ('${userId}', 'Test User', 'test@example.com')`));
    });

    it("should create a new form", async () => {
      const res = await formsRouter.request("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "My New Form",
          slug: "my-new-form",
          description: "A test form"
        }),
      }, {
        session: { user: { id: userId } }
      } as any);

      expect(res.status).toBe(201);
      const data = await res.json() as any;
      expect(data.name).toBe("My New Form");
      expect(data.slug).toBe("my-new-form");
      expect(data.id).toBeDefined();
    });

    it("should fail to create form if missing required fields", async () => {
      const res = await formsRouter.request("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Missing Slug",
        }),
      }, {
        session: { user: { id: userId } }
      } as any);

      expect(res.status).toBe(400);
    });

    it("should list forms for the authenticated user", async () => {
      // Pre-create a form
      await formsRouter.request("/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Form 1", slug: "form-1" }),
      }, { session: { user: { id: userId } } } as any);

      const res = await formsRouter.request("/", {
        method: "GET",
      }, {
        session: { user: { id: userId } }
      } as any);

      expect(res.status).toBe(200);
      const data = await res.json() as any;
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(1);
      expect(data[0].name).toBe("Form 1");
    });
  });

  describe("Form Actions Integration", () => {
    let formId: string;

    beforeEach(async () => {
      await clearDatabase();
      getSessionSpy.mockReset();
      getSessionSpy.mockImplementation(async () => ({
        user: { id: userId, email: "test@example.com" },
        session: { userId }
      }));
      await testDb.execute(sql.raw(`INSERT INTO "users" (id, name, email) VALUES ('${userId}', 'Test User', 'test@example.com')`));

      // Create a base form for actions
      const res = await formsRouter.request("/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Base Form", slug: "base-form", description: "Original" }),
      }, { session: { user: { id: userId } } } as any);
      const data = await res.json() as any;
      formId = data.id;
    });

    it("should delete a form", async () => {
      const res = await formsRouter.request(`/${formId}`, {
        method: "DELETE",
      }, { session: { user: { id: userId } } } as any);

      expect(res.status).toBe(200);

      // Verify it's gone
      const listRes = await formsRouter.request("/", { method: "GET" }, { session: { user: { id: userId } } } as any);
      const listData = await listRes.json() as any;
      expect(listData).toHaveLength(0);
    });

    it("should toggle form status", async () => {
      // Initial status should be true
      const res = await formsRouter.request(`/${formId}/toggle`, {
        method: "PATCH",
      }, { session: { user: { id: userId } } } as any);

      expect(res.status).toBe(200);
      const data = await res.json() as any;
      expect(data.isActive).toBe(false);

      // Toggle again
      const res2 = await formsRouter.request(`/${formId}/toggle`, {
        method: "PATCH",
      }, { session: { user: { id: userId } } } as any);
      const data2 = await res2.json() as any;
      expect(data2.isActive).toBe(true);
    });

    it("should duplicate a form", async () => {
      const res = await formsRouter.request(`/${formId}/duplicate`, {
        method: "POST",
      }, { session: { user: { id: userId } } } as any);

      expect(res.status).toBe(201);
      const data = await res.json() as any;
      expect(data.id).not.toBe(formId);
      expect(data.name).toBe("Base Form (Copie)");
      expect(data.slug).toContain("base-form-copy-");
      expect(data.description).toBe("Original");
    });

    it("should return 404 when acting on non-existent form", async () => {
      const fakeId = crypto.randomUUID();
      const res = await formsRouter.request(`/${fakeId}`, { method: "DELETE" }, { session: { user: { id: userId } } } as any);
      expect(res.status).toBe(404);
    });
  });
});
