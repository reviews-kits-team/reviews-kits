import { describe, expect, it, beforeEach, afterAll } from "bun:test";
import { testDb, clearDatabase, closeConnection } from "../IntegrationSetup";
import { DrizzleFormRepository } from "../../../src/infrastructure/repositories/DrizzleFormRepository";
import { DrizzleProjectRepository } from "../../../src/infrastructure/repositories/DrizzleProjectRepository";
import { DrizzleOrganizationRepository } from "../../../src/infrastructure/repositories/DrizzleOrganizationRepository";
import { Form } from "../../../src/domain/entities/Form";
import { Project } from "../../../src/domain/entities/Project";
import { Organization } from "../../../src/domain/entities/Organization";
import { Slug } from "../../../src/domain/value-objects/Slug";

describe("DrizzleFormRepository Integration", () => {
  const repository = new DrizzleFormRepository(testDb);
  const projectRepository = new DrizzleProjectRepository(testDb);
  const orgRepository = new DrizzleOrganizationRepository(testDb);

  beforeEach(async () => {
    await clearDatabase();
  });

  async function setupProject() {
    const org = new Organization({ id: crypto.randomUUID(), name: "Org", slug: Slug.create("org-" + Date.now()) });
    await orgRepository.save(org);
    const project = new Project({
      id: crypto.randomUUID(),
      organizationId: org.id,
      name: "P",
      slug: Slug.create("p-" + Date.now()),
      settings: {}
    });
    await projectRepository.save(project);
    return project;
  }

  it("should save and find a form by projectId and slug", async () => {
    const project = await setupProject();
    const form = new Form({
      id: crypto.randomUUID(),
      projectId: project.id,
      name: "Contact",
      slug: Slug.create("contact"),
      config: { title: "Contact Us" }
    });

    await repository.save(form);

    const found = await repository.findBySlug(project.id, "contact");
    expect(found).not.toBeNull();
    expect(found?.getName()).toBe("Contact");
  });

  it("should find forms by project ID", async () => {
    const project = await setupProject();
    const f1 = new Form({ id: crypto.randomUUID(), projectId: project.id, name: "F1", slug: Slug.create("f1"), config: {} });
    const f2 = new Form({ id: crypto.randomUUID(), projectId: project.id, name: "F2", slug: Slug.create("f2"), config: {} });

    await repository.save(f1);
    await repository.save(f2);

    const found = await repository.findByProject(project.id);
    expect(found).toHaveLength(2);
  });

  it("should update form configuration", async () => {
    const project = await setupProject();
    const form = new Form({
      id: crypto.randomUUID(),
      projectId: project.id,
      name: "Survey",
      slug: Slug.create("survey"),
      config: { steps: 1 }
    });

    await repository.save(form);

    form.updateConfig({ steps: 2 });
    await repository.update(form);

    const found = await repository.findById(form.id);
    expect(found?.getProps().config?.steps).toBe(2);
  });

  it("should delete a form", async () => {
    const project = await setupProject();
    const form = new Form({ id: crypto.randomUUID(), projectId: project.id, name: "D", slug: Slug.create("d"), config: {} });

    await repository.save(form);
    await repository.delete(form.id);

    const found = await repository.findById(form.id);
    expect(found).toBeNull();
  });
});
