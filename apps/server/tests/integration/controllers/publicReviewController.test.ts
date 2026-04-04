import { describe, expect, it, beforeAll, beforeEach } from "bun:test";
import { testDb, clearDatabase } from "../IntegrationSetup";
import { publicRouter } from "../../../src/interface/routes/public";
import { testRepositories } from '../../testContainer';
import { Form } from "../../../src/domain/entities/Form";
import { Slug } from "../../../src/domain/value-objects/Slug";
import { sql } from "drizzle-orm";

describe("Public Review Controller Integration", () => {
  const userId = "11111111-1111-1111-1111-111111111111";
  const formId = "22222222-2222-2222-2222-222222222222";
  const publicFormId = "rk_frm_live_test123";

  beforeAll(async () => {
    await clearDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    await testDb.execute(sql.raw(`INSERT INTO "users" (id, name, email) VALUES ('${userId}', 'Form Owner', 'owner@example.com')`));
    
    const form = new Form({
      id: formId,
      userId,
      name: "Test Form",
      slug: Slug.create("test-form"),
      publicId: publicFormId,
      config: {}
    });
    await testRepositories.formRepository.save(form);
  });

  it("should successfully submit a valid review", async () => {
    const res = await publicRouter.request("/reviews", {
      method: "POST",
      body: JSON.stringify({
        formId: publicFormId,
        content: "Great product!",
        authorName: "Valid User"
      }),
      headers: { "Content-Type": "application/json" }
    });

    expect(res.status).toBe(201);
    const data = await res.json() as any;
    expect(data.success).toBe(true);
    
    const testimonials = await testRepositories.testimonialRepository.findByUser(userId);
    expect(testimonials).toHaveLength(1);
    expect(testimonials[0]!.getProps().content).toBe("Great product!");
  });

  it("should silently drop honeypot submissions", async () => {
    const res = await publicRouter.request("/reviews", {
      method: "POST",
      body: JSON.stringify({
        formId: publicFormId,
        content: "Spam message",
        authorName: "Spammer",
        _honey: "im_a_bot"
      }),
      headers: { "Content-Type": "application/json" }
    });

    expect(res.status).toBe(201);
    const data = await res.json() as any;
    expect(data.success).toBe(true);
    
    const testimonials = await testRepositories.testimonialRepository.findByUser(userId);
    expect(testimonials).toHaveLength(0); // Should not be inserted!
  });

  it("should enforce rate limiting on frequent submissions", async () => {
    const headers = { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.100" };
    const body = JSON.stringify({
      formId: publicFormId,
      content: "Nice!",
      authorName: "Fast User"
    });

    // We allow 5 requests. Send 5
    for (let i = 0; i < 5; i++) {
      const res = await publicRouter.request("/reviews", { method: "POST", body, headers });
      expect(res.status).toBe(201);
    }

    // 6th should fail with 429
    const res6 = await publicRouter.request("/reviews", { method: "POST", body, headers });
    expect(res6.status).toBe(429);
  });
});
