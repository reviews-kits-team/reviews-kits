import { describe, expect, it, beforeEach, afterAll } from "bun:test";
import { testDb, clearDatabase, closeConnection } from "../IntegrationSetup";
import { DrizzleProjectRepository } from "../../../src/infrastructure/repositories/DrizzleProjectRepository";
import { DrizzleOrganizationRepository } from "../../../src/infrastructure/repositories/DrizzleOrganizationRepository";
import { Project } from "../../../src/domain/entities/Project";
import { Organization } from "../../../src/domain/entities/Organization";
import { Slug } from "../../../src/domain/value-objects/Slug";

describe("DrizzleProjectRepository Integration", () => {
  const repository = new DrizzleProjectRepository(testDb);
  const orgRepository = new DrizzleOrganizationRepository(testDb);

  beforeEach(async () => {
    await clearDatabase();
  });

  async function createOrg() {
    const org = new Organization({
      id: crypto.randomUUID(),
      name: "Org",
      slug: Slug.create("org-" + Date.now())
    });
    await orgRepository.save(org);
    return org;
  }

  it("should save and find a project by ID", async () => {
    const org = await createOrg();
    const project = new Project({
      id: crypto.randomUUID(),
      organizationId: org.id,
      name: "My Project",
      slug: Slug.create("my-project"),
      settings: { theme: "dark" }
    });

    await repository.save(project);

    const found = await repository.findById(project.id);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(project.id);
    expect(found?.getSettings().theme).toBe("dark");
  });

  it("should find projects by organization ID", async () => {
    const org = await createOrg();
    const p1 = new Project({
      id: crypto.randomUUID(),
      organizationId: org.id,
      name: "P1",
      slug: Slug.create("p1"),
      settings: {}
    });
    const p2 = new Project({
      id: crypto.randomUUID(),
      organizationId: org.id,
      name: "P2",
      slug: Slug.create("p2"),
      settings: {}
    });

    await repository.save(p1);
    await repository.save(p2);

    const found = await repository.findByOrganization(org.id);
    expect(found).toHaveLength(2);
  });

  it("should update project settings and maintain immutability", async () => {
    const org = await createOrg();
    const project = new Project({
      id: crypto.randomUUID(),
      organizationId: org.id,
      name: "P",
      slug: Slug.create("p"),
      settings: { color: "blue" }
    });

    await repository.save(project);

    project.updateSettings({ color: "red" });
    await repository.update(project);

    const found = await repository.findById(project.id);
    expect(found?.getSettings().color).toBe("red");
  });
});
