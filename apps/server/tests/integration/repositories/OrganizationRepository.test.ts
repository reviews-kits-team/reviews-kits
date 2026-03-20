import { describe, expect, it, beforeEach, afterAll } from "bun:test";
import { testDb, clearDatabase, closeConnection } from "../IntegrationSetup";
import { DrizzleOrganizationRepository } from "../../../src/infrastructure/repositories/DrizzleOrganizationRepository";
import { Organization } from "../../../src/domain/entities/Organization";
import { Slug } from "../../../src/domain/value-objects/Slug";

describe("DrizzleOrganizationRepository Integration", () => {
  const repository = new DrizzleOrganizationRepository(testDb);

  beforeEach(async () => {
    await clearDatabase();
  });

  it("should save and find an organization by ID", async () => {
    const org = new Organization({
      id: crypto.randomUUID(),
      name: "Acme Corp",
      slug: Slug.create("acme-corp")
    });

    await repository.save(org);

    const found = await repository.findById(org.id);
    expect(found).not.toBeNull();
    expect(found?.getName()).toBe("Acme Corp");
    expect(found?.getSlug()).toBe("acme-corp");
  });

  it("should find an organization by slug", async () => {
    const org = new Organization({
      id: crypto.randomUUID(),
      name: "Globex",
      slug: Slug.create("globex")
    });

    await repository.save(org);

    const found = await repository.findBySlug("globex");
    expect(found).not.toBeNull();
    expect(found?.id).toBe(org.id);
  });

  it("should update an existing organization", async () => {
    const org = new Organization({
      id: crypto.randomUUID(),
      name: "Initial Name",
      slug: Slug.create("initial-slug")
    });

    await repository.save(org);

    org.updateName("Updated Name");
    await repository.update(org);

    const found = await repository.findById(org.id);
    expect(found?.getName()).toBe("Updated Name");
  });

  it("should delete an organization", async () => {
    const org = new Organization({
      id: crypto.randomUUID(),
      name: "To Delete",
      slug: Slug.create("to-delete")
    });

    await repository.save(org);
    await repository.delete(org.id);

    const found = await repository.findById(org.id);
    expect(found).toBeNull();
  });
});
