import { describe, expect, it } from "bun:test";
import { Slug } from "../../../../src/domain/value-objects/Slug";

describe("Slug Value Object", () => {
  describe("Creation & Validation", () => {
    it("should create a valid slug", () => {
      const slug = Slug.create("valid-slug-123");
      expect(slug.getValue()).toBe("valid-slug-123");
    });

    it("should normalize slug by trimming and lowercasing", () => {
      const slug = Slug.create("  My-Cool-Slug  ");
      expect(slug.getValue()).toBe("my-cool-slug");
    });

    it("should transform invalid chars into hyphens and clean them up", () => {
      expect(Slug.create("invalid slug").getValue()).toBe("invalid-slug");
      expect(Slug.create("invalid_slug").getValue()).toBe("invalid-slug");
      expect(Slug.create("invalid@slug").getValue()).toBe("invalid-slug");
      expect(Slug.create("---invalid-slug---").getValue()).toBe("invalid-slug");
      expect(Slug.create("inv--slug").getValue()).toBe("inv-slug");
    });

    it("should still throw error for empty results", () => {
      expect(() => Slug.create("   ")).toThrow();
      expect(() => Slug.create("@#$%")).toThrow();
    });
  });

  describe("Equality", () => {
    it("should be equal if values are the same", () => {
      const slug1 = Slug.create("google");
      const slug2 = Slug.create("google");
      const slug3 = Slug.create("amazon");

      expect(slug1.equals(slug2)).toBe(true);
      expect(slug1.equals(slug3)).toBe(false);
    });
  });
});
