import { describe, expect, it, beforeEach, afterAll } from "bun:test";
import { testDb, clearDatabase, closeConnection } from "../IntegrationSetup";
import { DrizzleFormRepository } from "../../../src/infrastructure/repositories/DrizzleFormRepository";
import { Form } from "../../../src/domain/entities/Form";
import { Slug } from "../../../src/domain/value-objects/Slug";
import * as schema from "../../../src/infrastructure/database/schema";

describe("DrizzleFormRepository Integration", () => {
  const repository = new DrizzleFormRepository(testDb);
  const userId = crypto.randomUUID();

  beforeEach(async () => {
    await clearDatabase();
    await testDb.insert(schema.users).values({
      id: userId,
      email: "test@example.com",
      name: "Test User",
      emailVerified: true,
      isSystemAdmin: false
    });
  });

  it("should save and find a form by userId and slug", async () => {
    const form = new Form({
      id: crypto.randomUUID(),
      userId: userId,
      name: "Contact",
      slug: Slug.create("contact"),
      publicId: "rk_frm_live_contact",
      config: { title: "Contact Us" }
    });

    await repository.save(form);

    const found = await repository.findBySlug("contact");
    expect(found).not.toBeNull();
    expect(found?.getName()).toBe("Contact");
  });

  it("should find forms by user ID", async () => {
    const f1 = new Form({ id: crypto.randomUUID(), userId: userId, name: "F1", slug: Slug.create("f1"), publicId: "rk_frm_live_f1", config: {} });
    const f2 = new Form({ id: crypto.randomUUID(), userId: userId, name: "F2", slug: Slug.create("f2"), publicId: "rk_frm_live_f2", config: {} });

    await repository.save(f1);
    await repository.save(f2);

    const found = await repository.findByUser(userId);
    expect(found).toHaveLength(2);
  });

  it("should update form configuration", async () => {
    const form = new Form({
      id: crypto.randomUUID(),
      userId: userId,
      name: "Survey",
      slug: Slug.create("survey"),
      publicId: "rk_frm_live_survey",
      config: { steps: [] }
    });

    await repository.save(form);

    form.updateConfig({ steps: [{}, {}] as any });
    await repository.update(form);

    const found = await repository.findById(form.id);
    expect(found?.getProps().config?.steps).toHaveLength(2);
  });

  it("should delete a form", async () => {
    const form = new Form({ id: crypto.randomUUID(), userId: userId, name: "D", slug: Slug.create("d"), publicId: "rk_frm_live_d", config: {} });

    await repository.save(form);
    await repository.delete(form.id);

    const found = await repository.findById(form.id);
    expect(found).toBeNull();
  });

  it("should find a form by its public ID", async () => {
    const publicId = "rk_frm_live_findme";
    const form = new Form({
      id: crypto.randomUUID(),
      userId: userId,
      name: "Find Me",
      slug: Slug.create("find-me"),
      publicId,
      config: {}
    });

    await repository.save(form);
    const found = await repository.findByPublicId(publicId);
    
    expect(found).not.toBeNull();
    expect(found?.getName()).toBe("Find Me");
  });

  it("should find forms by multiple IDs and user ID", async () => {
    const f1 = new Form({ id: crypto.randomUUID(), userId: userId, name: "F1", slug: Slug.create("f1-multi"), publicId: "rk_frm_live_f1m", config: {} });
    const f2 = new Form({ id: crypto.randomUUID(), userId: userId, name: "F2", slug: Slug.create("f2-multi"), publicId: "rk_frm_live_f2m", config: {} });
    
    const otherUserId = crypto.randomUUID();
    await testDb.insert(schema.users).values({
      id: otherUserId,
      email: "other2@example.com",
      name: "Other User 2",
      emailVerified: true,
      isSystemAdmin: false
    });
    
    const f3 = new Form({ id: crypto.randomUUID(), userId: otherUserId, name: "F3", slug: Slug.create("f3-multi"), publicId: "rk_frm_live_f3m", config: {} });

    await repository.save(f1);
    await repository.save(f2);
    await repository.save(f3);

    const found = await repository.findByIdsAndUser([f1.id, f2.id, f3.id], userId);
    expect(found).toHaveLength(2);
    const foundIds = found.map(f => f.id);
    expect(foundIds).toContain(f1.id);
    expect(foundIds).toContain(f2.id);
    expect(foundIds).not.toContain(f3.id);
    
    const missing = await repository.findByIdsAndUser([f1.id], otherUserId);
    expect(missing).toHaveLength(0);
  });
});
