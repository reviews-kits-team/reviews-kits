import { expect, test, describe } from "bun:test";
import { roles } from "../../../../src/infrastructure/auth/permissions";

describe("RBAC Permissions Exhaustive Checks", () => {
  describe("Owner Role", () => {
    test("should have ALL permissions", () => {
      // Allowed
      expect(roles.owner.authorize({ project: ["create", "delete", "view"] }).success).toBe(true);
      expect(roles.owner.authorize({ member: ["invite", "remove", "update-role"] }).success).toBe(true);
      expect(roles.owner.authorize({ organization: ["create", "update", "delete", "view"] }).success).toBe(true);
      expect(roles.owner.authorize({ form: ["create", "update", "delete", "view"] }).success).toBe(true);
    });
  });

  describe("Admin Role", () => {
    test("should have most permissions including delete for org/project", () => {
      // Allowed
      expect(roles.admin.authorize({ project: ["create", "delete", "view"] }).success).toBe(true);
      expect(roles.admin.authorize({ member: ["invite", "remove"] }).success).toBe(true);
      expect(roles.admin.authorize({ organization: ["create", "update", "delete", "view"] }).success).toBe(true);
      expect(roles.admin.authorize({ form: ["create", "update", "delete", "view"] }).success).toBe(true);
      
      // NOT Allowed
      expect(roles.admin.authorize({ member: ["update-role"] }).success).toBe(false);
    });
  });

  describe("Editor Role", () => {
    test("should have creation/view permissions but NO destructive ones", () => {
      // Allowed
      expect(roles.editor.authorize({ project: ["create", "view"] }).success).toBe(true);
      expect(roles.editor.authorize({ form: ["create", "update", "view", "delete"] }).success).toBe(true);

      // NOT Allowed
      expect(roles.editor.authorize({ project: ["delete"] }).success).toBe(false);
      
      // Check that resources not in the role are actually not accessible (compiled check usually, but runtime too)
      // Since it's a runtime check in access.mjs, we cast to any to verify it returns failure
      expect((roles.editor as any).authorize({ member: ["invite"] }).success).toBe(false);
      expect((roles.editor as any).authorize({ organization: ["delete"] }).success).toBe(false);
    });
  });

  describe("Viewer Role", () => {
    test("should ONLY have view permissions", () => {
      // Allowed
      expect(roles.viewer.authorize({ project: ["view"] }).success).toBe(true);
      expect(roles.viewer.authorize({ organization: ["view"] }).success).toBe(true);
      expect(roles.viewer.authorize({ form: ["view"] }).success).toBe(true);

      // NOT Allowed
      expect(roles.viewer.authorize({ project: ["create"] }).success).toBe(false);
      expect(roles.viewer.authorize({ project: ["delete"] }).success).toBe(false);
      expect(roles.viewer.authorize({ organization: ["create"] }).success).toBe(false);
      expect(roles.viewer.authorize({ form: ["create"] }).success).toBe(false);

      // Cast to any for non-defined entities
      expect((roles.viewer as any).authorize({ member: ["invite"] }).success).toBe(false);
    });
  });
});
