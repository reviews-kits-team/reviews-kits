import { auth } from '../../../infrastructure/auth/auth';

export class RemoveMemberUseCase {
  async execute(organizationId: string, memberIdOrEmail: string, headers: Headers) {
    return auth.api.removeMember({
      headers,
      body: {
        memberIdOrEmail,
        organizationId,
      },
    });
  }
}
