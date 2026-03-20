import type { Context } from 'hono';
import { auth } from '../../infrastructure/auth/auth';
import { db } from '../../infrastructure/database/db';
import { DrizzleMemberRepository } from '../../infrastructure/repositories/DrizzleMemberRepository';
import { ListMembersUseCase } from '../../application/use-cases/member/ListMembersUseCase';
import { InviteMemberUseCase } from '../../application/use-cases/member/InviteMemberUseCase';
import { RemoveMemberUseCase } from '../../application/use-cases/member/RemoveMemberUseCase';
import { UpdateMemberRoleUseCase } from '../../application/use-cases/member/UpdateMemberRoleUseCase';

const memberRepository = new DrizzleMemberRepository(db);
const listMembersUseCase = new ListMembersUseCase(memberRepository);
const inviteMemberUseCase = new InviteMemberUseCase();
const removeMemberUseCase = new RemoveMemberUseCase();
const updateMemberRoleUseCase = new UpdateMemberRoleUseCase();

export const memberController = {
  /**
   * GET /:organizationId/members
   * Returns a list of all members in the organization using ListMembersUseCase.
   */
  list: async (c: Context) => {
    const organizationId = c.req.param('organizationId');
    if (!organizationId) return c.json({ error: 'Missing organizationId' }, 400);

    const members = await listMembersUseCase.execute(organizationId);

    return c.json({ members }, 200 as const);
  },

  /**
   * POST /:organizationId/members/invite
   * Sends an invitation to a user via Better-Auth's createInvitation.
   * Requires at least "admin" role (enforced by middleware).
   */
  invite: async (c: Context) => {
    const organizationId = c.req.param('organizationId')!;
    const { email, role } = await c.req.json();

    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json({ error: 'Unauthorized' }, 401);

    const invitation = await inviteMemberUseCase.execute(
      organizationId,
      email,
      role as any,
      c.req.raw.headers
    );

    return c.json({ invitation }, 201 as const);
  },

  /**
   * DELETE /:organizationId/members/:memberId
   * Removes a member from the organization via Better-Auth's removeMember.
   * Requires at least "admin" role (enforced by middleware).
   */
  remove: async (c: Context) => {
    const organizationId = c.req.param('organizationId')!;
    const memberId = c.req.param('memberId');
    if (!memberId) return c.json({ error: 'Missing memberId' }, 400);

    await removeMemberUseCase.execute(
      organizationId,
      memberId,
      c.req.raw.headers
    );

    return c.json({ message: 'Member removed successfully' }, 200 as const);
  },

  /**
   * PATCH /:organizationId/members/:memberId/role
   * Updates a member's role in the organization via Better-Auth's updateMemberRole.
   * Requires "owner" role (enforced by middleware).
   */
  updateRole: async (c: Context) => {
    const organizationId = c.req.param('organizationId')!;
    const memberId = c.req.param('memberId');
    if (!memberId) return c.json({ error: 'Missing memberId' }, 400);
    const { role } = await c.req.json();

    const updated = await updateMemberRoleUseCase.execute(
      organizationId,
      memberId,
      role as any,
      c.req.raw.headers
    );

    return c.json({ member: updated }, 200 as const);
  },
};
