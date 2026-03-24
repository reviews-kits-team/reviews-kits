import { describe, expect, it, beforeEach, afterEach, setSystemTime } from "bun:test";
import { User, type UserProps } from "../../../../src/domain/entities/User";

describe("User Entity", () => {
  const validProps: UserProps = {
    id: "user-1",
    email: "test@example.com",
    name: "John Doe",
    emailVerified: false,
    isSystemAdmin: false,
    avatarUrl: "https://example.com/avatar.png",
  };

  beforeEach(() => {
    setSystemTime(new Date("2024-01-01T00:00:00Z"));
  });

  afterEach(() => {
    setSystemTime(); // Reset to real time
  });

  describe("Creation", () => {
    it("should create a user with all properties", () => {
      const user = new User(validProps);
      
      expect(user.id).toBe(validProps.id);
      expect(user.getEmail()).toBe(validProps.email);
      expect(user.getName()).toBe(validProps.name);
      expect(user.getAvatarUrl()).toBe(validProps.avatarUrl);
      expect(user.getEmailVerified()).toBe(validProps.emailVerified);
      expect(user.getIsSystemAdmin()).toBe(validProps.isSystemAdmin);
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it("should create a user with minimal properties", () => {
      const minimalProps: UserProps = {
        id: "user-2",
        email: "minimal@example.com",
        name: "Minimal User",
        emailVerified: false,
        isSystemAdmin: false,
      };
      
      const user = new User(minimalProps);
      
      expect(user.id).toBe(minimalProps.id);
      expect(user.getEmail()).toBe(minimalProps.email);
      expect(user.getName()).toBe(minimalProps.name);
      expect(user.getAvatarUrl()).toBeUndefined();
    });

    it("should initialize default dates if not provided", () => {
      const user = new User(validProps);
      
      const props = user.getProps();
      expect(props.createdAt).toBeInstanceOf(Date);
      expect(props.updatedAt).toBeInstanceOf(Date);
    });

    it("should throw error if email is empty", () => {
      const invalidProps = { ...validProps, email: "" };
      expect(() => new User(invalidProps)).toThrow("User email cannot be empty");
    });

    it("should throw error if name is empty", () => {
      const invalidProps = { ...validProps, name: "" };
      expect(() => new User(invalidProps)).toThrow("User name cannot be empty");
    });
  });

  describe("Updates", () => {
    it("should update name and refresh updatedAt", () => {
      const user = new User(validProps);
      const initialUpdatedAt = user.getProps().updatedAt!;
      
      // Advance time manually
      setSystemTime(new Date("2024-01-01T00:00:01Z"));
      
      user.updateName("New Name");
      
      expect(user.getName()).toBe("New Name");
      expect(user.getProps().updatedAt!.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
    });

    it("should throw error when updating with empty name", () => {
      const user = new User(validProps);
      expect(() => user.updateName("")).toThrow("User name cannot be empty");
    });

    it("should update avatar and refresh updatedAt", () => {
      const user = new User(validProps);
      const initialUpdatedAt = user.getProps().updatedAt!;
      
      // Advance time manually
      setSystemTime(new Date("2024-01-01T00:00:01Z"));
      
      user.updateAvatar("https://new-avatar.com/img.png");
      
      expect(user.getAvatarUrl()).toBe("https://new-avatar.com/img.png");
      expect(user.getProps().updatedAt!.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
    });
  });

  describe("Data Access", () => {
    it("should return correct props via getProps", () => {
      const user = new User(validProps);
      const props = user.getProps();
      
      expect(props.id).toBe(validProps.id);
      expect(props.email).toBe(validProps.email);
      expect(props.name).toBe(validProps.name);
      expect(props.avatarUrl).toBe(validProps.avatarUrl);
    });
  });
});
