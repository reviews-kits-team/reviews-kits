import { describe, expect, it } from "bun:test";
import { Organization, type OrganizationProps } from "../../../../src/domain/entities/Organization";
import { Slug } from "../../../../src/domain/value-objects/Slug";

describe("Organization Entity", () => {
  const validSlug = Slug.create("google");
  const validProps: OrganizationProps = {
    id: "org-1",
    name: "Google",
    slug: validSlug,
  };

  describe("Creation", () => {
    it("should create an organization with all properties", () => {
      const org = new Organization(validProps);
      
      expect(org.id).toBe(validProps.id);
      expect(org.getName()).toBe(validProps.name);
      expect(org.getSlug()).toBe(validProps.slug.getValue());
      expect(org.createdAt).toBeInstanceOf(Date);
    });

    it("should initialize default dates if not provided", () => {
      const org = new Organization(validProps);
      
      const props = org.getProps();
      expect(props.createdAt).toBeInstanceOf(Date);
      expect(props.updatedAt).toBeInstanceOf(Date);
    });

    it("should throw error if name is empty", () => {
      const invalidProps = { ...validProps, name: "" };
      expect(() => new Organization(invalidProps)).toThrow("Organization name cannot be empty");
    });
  });

  describe("Updates", () => {
    it("should update name and refresh updatedAt", async () => {
      const org = new Organization(validProps);
      const initialUpdatedAt = org.getProps().updatedAt!;
      
      // Wait a bit to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      org.updateName("Alphabet");
      
      expect(org.getName()).toBe("Alphabet");
      expect(org.getProps().updatedAt!.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
    });

    it("should throw error when updating with empty name", () => {
      const org = new Organization(validProps);
      expect(() => org.updateName("")).toThrow("Organization name cannot be empty");
    });
  });

  describe("Data Access", () => {
    it("should return correct props via getProps", () => {
      const org = new Organization(validProps);
      const props = org.getProps();
      
      expect(props.id).toBe(validProps.id);
      expect(props.name).toBe(validProps.name);
      expect(props.slug).toBe(validProps.slug);
    });

    it("should return correct name and slug via getters", () => {
      const org = new Organization(validProps);
      expect(org.getName()).toBe("Google");
      expect(org.getSlug()).toBe("google");
    });
  });
});
