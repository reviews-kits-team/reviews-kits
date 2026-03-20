import { describe, expect, it } from "bun:test";
import { Project } from "../../../src/domain/entities/Project";
import { Form } from "../../../src/domain/entities/Form";
import { Slug } from "../../../src/domain/value-objects/Slug";
import { User } from "../../../src/domain/entities/User";
import { deepMerge } from "../../../src/shared/utils/deepMerge";

describe("Domain Hardening Edge Cases", () => {
  
  describe("Slug Robustness (Unicode & Normalization)", () => {
    it("should handle accented characters and spaces", () => {
      const slug = Slug.create("Étienne et Ses Délices");
      expect(slug.getValue()).toBe("etienne-et-ses-delices");
    });
  });

  describe("Deep Merge (Project & Form)", () => {
    it("should perform deep merge of nested settings in Project", () => {
      const project = new Project({
        id: "p1",
        organizationId: "o1",
        name: "Test",
        slug: Slug.create("test"),
        settings: {
          theme: { primary: "red", font: "Inter" },
          features: { chat: true }
        }
      });

      project.updateSettings({
        theme: { primary: "blue" }
      });

      const settings = project.getSettings();
      expect(settings.theme.primary).toBe("blue");
      expect(settings.theme.font).toBe("Inter"); // Should NOT be lost
      expect(settings.features.chat).toBe(true);  // Should NOT be lost
    });

    it("should perform deep merge of nested config in Form", () => {
      const form = new Form({
        id: "f1",
        projectId: "p1",
        name: "Form",
        slug: Slug.create("form"),
        config: {
          styles: { color: "black", margin: 10 }
        }
      });

      form.updateConfig({
        styles: { color: "white" }
      });

      const config = form.getProps().config!;
      expect(config.styles.color).toBe("white");
      expect(config.styles.margin).toBe(10); // Should NOT be lost
    });
  });

  describe("Entity Identity Equality", () => {
    it("should be equal if IDs are the same, regardless of other props", () => {
      const user1 = new User({ id: "u1", email: "a@a.com", name: "A", emailVerified: false, isSystemAdmin: false });
      const user2 = new User({ id: "u1", email: "b@b.com", name: "B", emailVerified: false, isSystemAdmin: false });
      const user3 = new User({ id: "u2", email: "a@a.com", name: "A", emailVerified: false, isSystemAdmin: false });

      expect(user1.equals(user2)).toBe(true);
      expect(user1.equals(user3)).toBe(false);
    });
  });

  describe("Props Immutability", () => {
    it("should not allow modifying internal state via props reference", () => {
      const project = new Project({
        id: "p1",
        organizationId: "o1",
        name: "Test",
        slug: Slug.create("test"),
        settings: { theme: "dark" }
      });

      const props = project.getProps();
      if (props.settings) {
        props.settings.theme = "light";
      }

      expect(project.getSettings().theme).toBe("dark"); // Internal state should remain dark
    });
  });

  describe("Advanced DeepMerge Features", () => {
    it("should handle special types like Date", () => {
      const now = new Date();
      const target = { metadata: { lastSync: new Date(0) } };
      const source = { metadata: { lastSync: now } };
      
      const result = deepMerge(target, source);
      expect(result.metadata.lastSync.getTime()).toBe(now.getTime());
      expect(result.metadata.lastSync).not.toBe(now); // Should be a copy
    });

    it("should handle circular references", () => {
      const target: any = { a: 1 };
      const source: any = { b: 2 };
      source.self = source; // Circular ref

      const result = deepMerge(target, source);
      expect(result.b).toBe(2);
      expect(result.a).toBe(1);
      expect(result.self).toBe(result);
    });

    it("should support array concat strategy", () => {
      const target = { tags: ["a", "b"] };
      const source = { tags: ["c"] };
      
      const result = deepMerge(target, source, { arrayStrategy: "concat" });
      expect(result.tags).toEqual(["a", "b", "c"]);
    });
  });
});
