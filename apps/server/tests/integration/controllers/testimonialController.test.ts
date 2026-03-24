import { describe, expect, it, beforeEach } from "bun:test";
import { testDb, clearDatabase } from "../IntegrationSetup";
import { testimonialsRouter } from "../../../src/interface/routes/testimonials";
import { container } from "../../../src/infrastructure/container";
import { Testimonial } from "../../../src/domain/entities/Testimonial";
import crypto from "node:crypto";
import { sql } from "drizzle-orm";

describe("Testimonial Controller Integration", () => {
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

    // Setup session for better-auth bearer plugin
    await testDb.execute(sql`
      INSERT INTO "sessions" (id, user_id, token, expires_at) 
      VALUES (${sessionId}, ${userId}, ${sessionToken}, ${new Date(Date.now() + 3600000)})
    `);
  });

  const authHeaders = {
    "Authorization": `Bearer ${sessionToken}`,
    "Content-Type": "application/json"
  };

  it("should update testimonial status", async () => {
    const testimonial = new Testimonial({
      id: crypto.randomUUID(),
      userId,
      content: "Test content",
      authorName: "Author",
      status: "pending",
      source: "api"
    });
    await container.testimonialRepository.save(testimonial);

    const res = await testimonialsRouter.request(`/${testimonial.getId()}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "approved" }),
      headers: authHeaders
    });

    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(data.success).toBe(true);
    expect(data.status).toBe("approved");

    const updated = await container.testimonialRepository.findById(testimonial.getId());
    expect(updated?.getStatus()).toBe("approved");
  });

  it("should delete testimonial", async () => {
    const testimonial = new Testimonial({
      id: crypto.randomUUID(),
      userId,
      content: "To be deleted",
      authorName: "Author",
      status: "pending",
      source: "api"
    });
    await container.testimonialRepository.save(testimonial);

    const res = await testimonialsRouter.request(`/${testimonial.getId()}`, {
      method: "DELETE",
      headers: authHeaders
    });

    expect(res.status).toBe(200);
    const updated = await container.testimonialRepository.findById(testimonial.getId());
    expect(updated).toBeNull();
  });

  it("should batch update status", async () => {
    const t1 = new Testimonial({ id: crypto.randomUUID(), userId, content: "T1", authorName: "A1", status: "pending", source: "api" });
    const t2 = new Testimonial({ id: crypto.randomUUID(), userId, content: "T2", authorName: "A2", status: "pending", source: "api" });
    await container.testimonialRepository.save(t1);
    await container.testimonialRepository.save(t2);

    const res = await testimonialsRouter.request("/batch-status", {
      method: "POST",
      body: JSON.stringify({ ids: [t1.getId(), t2.getId()], status: "approved" }),
      headers: authHeaders
    });

    expect(res.status).toBe(200);
    const updated1 = await container.testimonialRepository.findById(t1.getId());
    const updated2 = await container.testimonialRepository.findById(t2.getId());
    expect(updated1?.getStatus()).toBe("approved");
    expect(updated2?.getStatus()).toBe("approved");
  });

  it("should batch delete testimonials", async () => {
    const t1 = new Testimonial({ id: crypto.randomUUID(), userId, content: "T1", authorName: "A1", status: "pending", source: "api" });
    const t2 = new Testimonial({ id: crypto.randomUUID(), userId, content: "T2", authorName: "A2", status: "pending", source: "api" });
    await container.testimonialRepository.save(t1);
    await container.testimonialRepository.save(t2);

    const res = await testimonialsRouter.request("/batch-delete", {
      method: "POST",
      body: JSON.stringify({ ids: [t1.getId(), t2.getId()] }),
      headers: authHeaders
    });

    expect(res.status).toBe(200);
    const updated1 = await container.testimonialRepository.findById(t1.getId());
    const updated2 = await container.testimonialRepository.findById(t2.getId());
    expect(updated1).toBeNull();
    expect(updated2).toBeNull();
  });

  it("should reject batch operations if user does not own all testimonials", async () => {
    const otherUserId = crypto.randomUUID();
    await testDb.execute(sql`
      INSERT INTO "users" (id, name, email) 
      VALUES (${otherUserId}, 'Other User', 'other@example.com')
    `);

    const t1 = new Testimonial({ id: crypto.randomUUID(), userId, content: "My Testimonial", authorName: "Me", status: "pending", source: "api" });
    const t2 = new Testimonial({ id: crypto.randomUUID(), userId: otherUserId, content: "Not Mine", authorName: "Other", status: "pending", source: "api" });
    await container.testimonialRepository.save(t1);
    await container.testimonialRepository.save(t2);

    const res = await testimonialsRouter.request("/batch-status", {
      method: "POST",
      body: JSON.stringify({ ids: [t1.getId(), t2.getId()], status: "approved" }),
      headers: authHeaders
    });

    expect(res.status).toBe(403);
    const updated1 = await container.testimonialRepository.findById(t1.getId());
    expect(updated1?.getStatus()).toBe("pending"); // Should NOT have changed
  });

  it("should reject reordering if user does not own all testimonials", async () => {
    const otherUserId = crypto.randomUUID();
    await testDb.execute(sql`
      INSERT INTO "users" (id, name, email) 
      VALUES (${otherUserId}, 'Other User Reorder', 'other-reorder@example.com')
    `);

    const t1 = new Testimonial({ id: crypto.randomUUID(), userId: otherUserId, content: "Not Mine", authorName: "Other", status: "pending", source: "api" });
    await container.testimonialRepository.save(t1);

    const res = await testimonialsRouter.request("/reorder", {
      method: "POST",
      body: JSON.stringify({ positions: [{ id: t1.getId(), position: 1 }] }),
      headers: authHeaders
    });

    expect(res.status).toBe(403);
  });

  it("should allow reordering if user owns all testimonials", async () => {
    const t1 = new Testimonial({ id: crypto.randomUUID(), userId, content: "Mine 1", authorName: "Me", status: "pending", source: "api" });
    const t2 = new Testimonial({ id: crypto.randomUUID(), userId, content: "Mine 2", authorName: "Me", status: "pending", source: "api" });
    await container.testimonialRepository.save(t1);
    await container.testimonialRepository.save(t2);

    const res = await testimonialsRouter.request("/reorder", {
      method: "POST",
      body: JSON.stringify({ 
        positions: [
          { id: t1.getId(), position: 2 },
          { id: t2.getId(), position: 1 }
        ] 
      }),
      headers: authHeaders
    });

    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(data.success).toBe(true);
  });
});
