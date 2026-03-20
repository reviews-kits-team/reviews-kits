import { describe, expect, it, beforeEach, afterAll } from "bun:test";
import { testDb, clearDatabase, closeConnection } from "../IntegrationSetup";
import { DrizzleTestimonialRepository } from "../../../src/infrastructure/repositories/DrizzleTestimonialRepository";
import { Testimonial } from "../../../src/domain/entities/Testimonial";
import { Slug } from "../../../src/domain/value-objects/Slug";
import { Rating } from "../../../src/domain/value-objects/Rating";
import * as schema from "../../../src/infrastructure/database/schema";

describe("DrizzleTestimonialRepository Integration", () => {
  const repository = new DrizzleTestimonialRepository(testDb);
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

  it("should save and find a testimonial by ID", async () => {
    const testimonial = new Testimonial({
      id: crypto.randomUUID(),
      userId: userId,
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

  it("should find testimonials by user ID and status filter", async () => {
    const t1 = new Testimonial({
      id: crypto.randomUUID(),
      userId: userId,
      content: "T1",
      authorName: "A1",
      status: "pending",
      source: "api"
    });
    const t2 = new Testimonial({
      id: crypto.randomUUID(),
      userId: userId,
      content: "T2",
      authorName: "A2",
      status: "approved",
      source: "api"
    });

    await repository.save(t1);
    await repository.save(t2);

    const all = await repository.findByUser(userId);
    expect(all).toHaveLength(2);

    const approved = await repository.findByUser(userId, { status: "approved" });
    expect(approved).toHaveLength(1);
    expect(approved[0]!.getProps().status).toBe("approved");
  });

  it("should update testimonial status and content", async () => {
    const testimonial = new Testimonial({
      id: crypto.randomUUID(),
      userId: userId,
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
    const testimonial = new Testimonial({
      id: crypto.randomUUID(),
      userId: userId,
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
