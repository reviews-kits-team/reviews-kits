import { describe, expect, it, beforeEach, afterAll } from "bun:test";
import { testDb, clearDatabase, closeConnection } from "../IntegrationSetup";
import { DrizzleTestimonialRepository } from "../../../src/infrastructure/repositories/DrizzleTestimonialRepository";
import { DrizzleProjectRepository } from "../../../src/infrastructure/repositories/DrizzleProjectRepository";
import { DrizzleOrganizationRepository } from "../../../src/infrastructure/repositories/DrizzleOrganizationRepository";
import { Testimonial } from "../../../src/domain/entities/Testimonial";
import { Project } from "../../../src/domain/entities/Project";
import { Organization } from "../../../src/domain/entities/Organization";
import { Slug } from "../../../src/domain/value-objects/Slug";
import { Rating } from "../../../src/domain/value-objects/Rating";

describe("DrizzleTestimonialRepository Integration", () => {
  const repository = new DrizzleTestimonialRepository(testDb);
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

  it("should save and find a testimonial by ID", async () => {
    const project = await setupProject();
    const testimonial = new Testimonial({
      id: crypto.randomUUID(),
      projectId: project.id,
      content: "Great service!",
      authorName: "John Doe",
      rating: Rating.create(5),
      status: "approved",
      source: "api"
    });

    await repository.save(testimonial);

    const found = await repository.findById(testimonial.id);
    expect(found).not.toBeNull();
    expect(found?.getProps().content).toBe("Great service!");
    expect(found?.getProps().rating?.getValue()).toBe(5);
  });

  it("should find testimonials by project ID and status filter", async () => {
    const project = await setupProject();
    const t1 = new Testimonial({
      id: crypto.randomUUID(),
      projectId: project.id,
      content: "T1",
      authorName: "A1",
      status: "pending",
      source: "api"
    });
    const t2 = new Testimonial({
      id: crypto.randomUUID(),
      projectId: project.id,
      content: "T2",
      authorName: "A2",
      status: "approved",
      source: "api"
    });

    await repository.save(t1);
    await repository.save(t2);

    const all = await repository.findByProject(project.id);
    expect(all).toHaveLength(2);

    const approved = await repository.findByProject(project.id, { status: "approved" });
    expect(approved).toHaveLength(1);
    expect(approved[0]!.getProps().status).toBe("approved");
  });

  it("should update testimonial status and content", async () => {
    const project = await setupProject();
    const testimonial = new Testimonial({
      id: crypto.randomUUID(),
      projectId: project.id,
      content: "Old content",
      authorName: "John",
      status: "pending",
      source: "api"
    });

    await repository.save(testimonial);

    testimonial.approve();
    testimonial.updateContent("New content");
    await repository.update(testimonial);

    const found = await repository.findById(testimonial.id);
    expect(found?.getProps().status).toBe("approved");
    expect(found?.getProps().content).toBe("New content");
  });

  it("should delete a testimonial", async () => {
    const project = await setupProject();
    const testimonial = new Testimonial({
      id: crypto.randomUUID(),
      projectId: project.id,
      content: "Delete me",
      authorName: "Ghost",
      status: "pending",
      source: "api"
    });

    await repository.save(testimonial);
    await repository.delete(testimonial.id);

    const found = await repository.findById(testimonial.id);
    expect(found).toBeNull();
  });
});
