import { createAccessControl } from "better-auth/plugins/access";

const statements = {
  project: ["create", "delete", "view"],
  member: ["invite", "remove", "update-role"],
  organization: ["create", "update", "delete", "view"],
  form: ["create", "update", "delete", "view"],
  // Required by better-auth internals: createInvitation checks invitation.create,
  // cancelInvitation checks invitation.cancel
  invitation: ["create", "cancel"],
} as const;

export const ac = createAccessControl(statements);

export const roles = {
  owner: ac.newRole({
    project: ["create", "delete", "view"],
    member: ["invite", "remove", "update-role"],
    organization: ["create", "update", "delete", "view"],
    form: ["create", "update", "delete", "view"],
    invitation: ["create", "cancel"],
  }),
  admin: ac.newRole({
    project: ["create", "delete", "view"],
    member: ["invite", "remove"],
    organization: ["create", "update", "delete", "view"],
    form: ["create", "update", "delete", "view"],
    invitation: ["create", "cancel"],
  }),
  editor: ac.newRole({
    project: ["create", "view"],
    form: ["create", "update", "view", "delete"],
  }),
  viewer: ac.newRole({
    project: ["view"],
    organization: ["view"],
    form: ["view"],
  }),
};
