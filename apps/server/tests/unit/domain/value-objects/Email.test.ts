import { describe, expect, it } from "bun:test";
import { Email } from "../../../../src/domain/value-objects/Email";

describe("Email Value Object", () => {
  describe("Creation & Validation", () => {
    it("should create a valid email", () => {
      const email = Email.create("test@example.com");
      expect(email.getValue()).toBe("test@example.com");
    });

    it("should normalize email by trimming and lowercasing", () => {
      const email = Email.create("  TEST@Example.COM  ");
      expect(email.getValue()).toBe("test@example.com");
    });

    it("should throw error for invalid email formats", () => {
      const invalidEmails = [
        "plainaddress",
        "#@%^%#$@#$@#.com",
        "@example.com",
        "Joe Smith <email@example.com>",
        "email.example.com",
        "email@example@example.com",
      ];

      invalidEmails.forEach(val => {
        expect(() => Email.create(val)).toThrow(`Invalid email: ${val.toLowerCase().trim()}`);
      });
    });
  });

  describe("Equality", () => {
    it("should be equal if values are the same", () => {
      const email1 = Email.create("TEST@gmail.com");
      const email2 = Email.create("test@gmail.com");
      const email3 = Email.create("other@gmail.com");

      expect(email1.equals(email2)).toBe(true);
      expect(email1.equals(email3)).toBe(false);
    });
  });
});
