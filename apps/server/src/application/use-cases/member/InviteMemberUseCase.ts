import { auth } from '../../../infrastructure/auth/auth';

type RoleType = "owner" | "admin" | "editor" | "viewer";

export class InviteMemberUseCase {
  async execute(organizationId: string, email: string, role: RoleType, headers: Headers) {
    // better-auth requires the 'organization-id' header to identify the active
    // organization when performing its internal permission check inside createInvitation.
    // Without it, the caller's role cannot be resolved and the request is rejected.
    const enrichedHeaders = new Headers(headers);
    enrichedHeaders.set('organization-id', organizationId);

    return auth.api.createInvitation({
      headers: enrichedHeaders,
      body: {
        email,
        role,
        organizationId,
      },
    });
  }
}
