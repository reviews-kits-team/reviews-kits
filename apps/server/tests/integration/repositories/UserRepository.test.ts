import { describe, expect, it, beforeEach } from "bun:test";
import { testDb, clearDatabase } from "../IntegrationSetup";
import { DrizzleUserRepository } from "../../../src/infrastructure/repositories/DrizzleUserRepository";
import { User } from "../../../src/domain/entities/User";

describe("DrizzleUserRepository Integration", () => {
  const repository = new DrizzleUserRepository(testDb as any);

  beforeEach(async () => {
    await clearDatabase();
  });

  it("should find all users", async () => {
    // We can't easily "save" a user with this repository yet (no save method)
    // But we can insert directly with drizzle for testing purposes
    const id = crypto.randomUUID();
    await testDb.insert(require("../../../src/infrastructure/database/schema").users).values({
      id,
      email: "user1@example.com",
      name: "User One",
      emailVerified: true,
      isSystemAdmin: false,
    });

    const users = await repository.findAll();
    expect(users).toHaveLength(1);
    expect(users[0]!.getEmail()).toBe("user1@example.com");
  });

  it("should find user by ID", async () => {
    const id = crypto.randomUUID();
    await testDb.insert(require("../../../src/infrastructure/database/schema").users).values({
      id,
      email: "findme@example.com",
      name: "Find Me",
      emailVerified: true,
      isSystemAdmin: true,
    });

    const found = await repository.findById(id);
    expect(found).not.toBeNull();
    expect(found?.getEmail()).toBe("findme@example.com");
    expect(found?.getIsSystemAdmin()).toBe(true);
  });

  it("should find user by email", async () => {
    await testDb.insert(require("../../../src/infrastructure/database/schema").users).values({
      id: crypto.randomUUID(),
      email: "search@example.com",
      name: "Search Me",
      emailVerified: true,
      isSystemAdmin: false,
    });

    const found = await repository.findByEmail("search@example.com");
    expect(found).not.toBeNull();
    expect(found?.getName()).toBe("Search Me");
  });
});
