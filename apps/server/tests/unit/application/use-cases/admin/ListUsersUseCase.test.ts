import { describe, expect, it, mock } from "bun:test";
import { ListUsersUseCase } from "../../../../../src/application/use-cases/admin/ListUsersUseCase";
import { User } from "../../../../../src/domain/entities/User";
import type { IUserRepository } from "../../../../../src/domain/repositories/UserRepository";

describe("ListUsersUseCase", () => {
  it("should return all users from repository as props", async () => {
    // Arrange
    const mockUsers = [
      new User({ id: "1", email: "a@a.com", name: "A", emailVerified: true, isSystemAdmin: true }),
      new User({ id: "2", email: "b@b.com", name: "B", emailVerified: false, isSystemAdmin: false }),
    ];

    const mockRepo: IUserRepository = {
      findAll: mock(() => Promise.resolve(mockUsers)),
      findById: mock(() => Promise.resolve(null)),
      findByEmail: mock(() => Promise.resolve(null)),
    };

    const useCase = new ListUsersUseCase(mockRepo);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toHaveLength(2);
    const [user1, user2] = result;
    expect(user1!.id).toBe("1");
    expect(user1!.email).toBe("a@a.com");
    expect(user1!.isSystemAdmin).toBe(true);
    expect(user2!.id).toBe("2");
    expect(user2!.isSystemAdmin).toBe(false);
    expect(mockRepo.findAll).toHaveBeenCalled();
  });

  it("should return empty array if no users found", async () => {
    // Arrange
    const mockRepo: IUserRepository = {
      findAll: mock(() => Promise.resolve([])),
      findById: mock(() => Promise.resolve(null)),
      findByEmail: mock(() => Promise.resolve(null)),
    };

    const useCase = new ListUsersUseCase(mockRepo);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toEqual([]);
    expect(mockRepo.findAll).toHaveBeenCalled();
  });
});
