import { describe, expect, it, beforeEach } from "bun:test";
import { testDb, clearDatabase } from "../IntegrationSetup";
import { formsRouter } from "../../../src/interface/routes/forms";
import { container } from "../../../src/infrastructure/container";
import { Form } from "../../../src/domain/entities/Form";
import { Slug } from "../../../src/domain/value-objects/Slug";
import crypto from "node:crypto";
import { sql } from "drizzle-orm";

describe("Form Controller Integration", () => {
  const userId = crypto.randomUUID();
  const sessionId = crypto.randomUUID();
  const sessionToken = "test-token-" + crypto.randomBytes(16).toString("hex");

  beforeEach(async () => {
    await clearDatabase();
    
    // Setup user
    await testDb.execute(sql`
      INSERT INTO "users" (id, name, email, email_verified, is_system_admin) 
      VALUES (${userId}, 'Test User', 'test@example.com', true, false)
    `);

    // Setup session
    await testDb.execute(sql`
      INSERT INTO "sessions" (id, user_id, token, expires_at) 
      VALUES (${sessionId}, ${userId}, ${sessionToken}, ${new Date(Date.now() + 3600000)})
    `);
  });

  const authHeaders = {
    "Authorization": `Bearer ${sessionToken}`,
    "Content-Type": "application/json"
  };

  it("should create a new form", async () => {
    const res = await formsRouter.request("/", {
      method: "POST",
      body: JSON.stringify({
        name: "New Form",
        slug: "new-form",
        accentColor: "#0D9E75"
      }),
      headers: authHeaders
    });

    expect(res.status).toBe(201);
    const data = await res.json() as any;
    expect(data.id).toBeDefined();

    const forms = await container.formRepository.findByUser(userId);
    expect(forms).toHaveLength(1);
    expect(forms[0]!.getName()).toBe("New Form");
  });

  it("should list user forms", async () => {
    const form = new Form({
      id: crypto.randomUUID(),
      userId,
      name: "Existing Form",
      slug: Slug.create("existing-form"),
      publicId: "rk_frm_live_existing",
      config: {}
    });
    await container.formRepository.save(form);

    const res = await formsRouter.request("/", {
      method: "GET",
      headers: authHeaders
    });

    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe("Existing Form");
  });

  it("should update form basic info", async () => {
    const form = new Form({
      id: crypto.randomUUID(),
      userId,
      name: "Old Name",
      slug: Slug.create("old-name"),
      publicId: "rk_frm_live_old",
      config: {}
    });
    await container.formRepository.save(form);

    const res = await formsRouter.request(`/${form.getId()}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: "New Name",
        description: "Updated description"
      }),
      headers: authHeaders
    });

    expect(res.status).toBe(200);
    const updated = await container.formRepository.findById(form.getId());
    expect(updated?.getName()).toBe("New Name");
    expect(updated?.getProps().description).toBe("Updated description");
  });

  it("should toggle form active status", async () => {
    const form = new Form({
      id: crypto.randomUUID(),
      userId,
      name: "Form",
      slug: Slug.create("form"),
      publicId: "rk_frm_live_form",
      isActive: true,
      config: {}
    });
    await container.formRepository.save(form);

    const res = await formsRouter.request(`/${form.getId()}/toggle`, {
      method: "PATCH",
      headers: authHeaders
    });

    expect(res.status).toBe(200);
    const updated = await container.formRepository.findById(form.getId());
    expect(updated?.getIsActive()).toBe(false);
  });
});
