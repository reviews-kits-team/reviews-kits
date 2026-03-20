import { describe, expect, it } from "bun:test";
import { Rating } from "../../../../src/domain/value-objects/Rating";

describe("Rating Value Object", () => {
  describe("Creation & Validation", () => {
    it("should create a valid rating", () => {
      [1, 2, 3, 4, 5].forEach(val => {
        const rating = Rating.create(val);
        expect(rating.getValue()).toBe(val);
      });
    });

    it("should throw error for values outside range 1-5", () => {
      const invalidRatings = [0, 6, -1, 10];

      invalidRatings.forEach(val => {
        expect(() => Rating.create(val)).toThrow(`Rating must be between 1 and 5, got: ${val}`);
      });
    });

    it("should throw error for non-integer values", () => {
      expect(() => Rating.create(4.5)).toThrow("Rating must be between 1 and 5, got: 4.5");
    });
  });

  describe("Equality", () => {
    it("should be equal if values are the same", () => {
      const rating1 = Rating.create(5);
      const rating2 = Rating.create(5);
      const rating3 = Rating.create(4);

      expect(rating1.equals(rating2)).toBe(true);
      expect(rating1.equals(rating3)).toBe(false);
    });
  });
});
