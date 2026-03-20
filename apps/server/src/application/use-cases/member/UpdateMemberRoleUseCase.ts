import { auth } from '../../../infrastructure/auth/auth';

type RoleType = "owner" | "admin" | "editor" | "viewer";

export class UpdateMemberRoleUseCase {
  async execute(organizationId: string, memberId: string, role: RoleType, headers: Headers) {
    return auth.api.updateMemberRole({
      headers,
      body: {
        memberId,
        role,
        organizationId,
      },
    });
  }
}
