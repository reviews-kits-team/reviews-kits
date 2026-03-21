import { describe, expect, it, beforeAll, beforeEach, spyOn } from "bun:test";
import { testDb, clearDatabase } from "../IntegrationSetup";
import { formsRouter } from "../../../src/interface/routes/forms";
import { auth } from "../../../src/infrastructure/auth/auth";
import { sql } from "drizzle-orm";

describe("Forms Integration", () => {
  const userId = "00000000-0000-0000-0000-000000000001";
  const getSessionSpy = spyOn(auth.api, "getSession") as any;

  beforeAll(async () => {
    await clearDatabase();
  });

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
