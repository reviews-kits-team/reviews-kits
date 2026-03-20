import { z } from 'zod';
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { hasRole } from '../../shared/middlewares/rbac';
import { isAuthenticated } from '../../shared/middlewares/auth';
import { organizationController } from '../controllers/organizationController';
import { memberController } from '../controllers/memberController';

export const orgRouter = new OpenAPIHono();

// ─── Zod Schemas ─────────────────────────────────────────────────────────────
const orgIdParam = z.object({
  organizationId: z.string().uuid().openapi({
    param: { name: 'organizationId', in: 'path' },
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
});

const memberIdParam = z.object({
  organizationId: z.string().uuid().openapi({
    param: { name: 'organizationId', in: 'path' },
    example: '123e4567-e89b-12d3-a456-426614174000'
  }),
  memberId: z.string().uuid().openapi({
    param: { name: 'memberId', in: 'path' },
    example: '987f6543-e21a-42c3-b456-426614174000'
  })
});

const inviteBody = z.object({
  email: z.string().email().openapi({ example: 'jane@example.com' }),
  role: z.enum(['admin', 'editor', 'viewer']).openapi({ example: 'editor' })
});

const updateRoleBody = z.object({
  role: z.enum(['admin', 'editor', 'viewer']).openapi({ example: 'admin' })
});

// ─── Route: GET /:organizationId/projects ───────────────────────────────────
const getProjectsRoute = createRoute({
  method: 'get',
  path: '/{organizationId}/projects',
  summary: 'List all projects for a specific organization',
  tags: ['Organizations'],
  middleware: [hasRole('viewer')],
  request: { params: orgIdParam },
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ organizationId: z.string(), projects: z.array(z.any()), _metadata: z.object({ message: z.string() }) }) } },
      description: 'List of projects'
    }
  }
});

// ─── Route: GET /:organizationId/members ────────────────────────────────────
const getMembersRoute = createRoute({
  method: 'get',
  path: '/{organizationId}/members',
  summary: 'List all members of an organization',
  tags: ['Members'],
  middleware: [hasRole('viewer')],
  request: { params: orgIdParam },
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ members: z.array(z.object({ id: z.string(), role: z.string(), userId: z.string(), userName: z.string(), userEmail: z.string(), createdAt: z.string() })) }) } },
      description: 'List of members'
    },
    400: { description: 'Missing organizationId parameter' }
  }
});

// ─── Route: POST /:organizationId/members/invite ────────────────────────────
const inviteMemberRoute = createRoute({
  method: 'post',
  path: '/{organizationId}/members/invite',
  summary: 'Invite a user to the organization (admin or above)',
  tags: ['Members'],
  middleware: [hasRole('admin')],
  request: {
    params: orgIdParam,
    body: { content: { 'application/json': { schema: inviteBody } }, required: true }
  },
  responses: {
    201: {
      content: { 'application/json': { schema: z.object({ invitation: z.any() }) } },
      description: 'Invitation created'
    },
    400: { description: 'Invalid email or role' },
    403: { description: 'Insufficient permissions' }
  }
});

// ─── Route: DELETE /:organizationId/members/:memberId ───────────────────────
const removeMemberRoute = createRoute({
  method: 'delete',
  path: '/{organizationId}/members/{memberId}',
  summary: 'Remove a member from the organization (admin or above)',
  tags: ['Members'],
  middleware: [hasRole('admin')],
  request: { params: memberIdParam },
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ message: z.string() }) } },
      description: 'Member removed'
    },
    403: { description: 'Insufficient permissions' }
  }
});

// ─── Route: PATCH /:organizationId/members/:memberId/role ───────────────────
const updateMemberRoleRoute = createRoute({
  method: 'patch',
  path: '/{organizationId}/members/{memberId}/role',
  summary: "Update a member's role (owner only)",
  tags: ['Members'],
  middleware: [hasRole('owner')],
  request: {
    params: memberIdParam,
    body: { content: { 'application/json': { schema: updateRoleBody } }, required: true }
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ member: z.any() }) } },
      description: 'Role updated'
    },
    403: { description: 'Owner role required' }
  }
});

// ─── Route: POST / (create organization) ───────────────────────────────────
const createOrgRoute = createRoute({
  method: 'post',
  path: '/',
  summary: 'Create a new organization (authenticated users only)',
  tags: ['Organizations'],
  middleware: [isAuthenticated],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().min(2).openapi({ example: 'Acme Corp' }),
            slug: z.string().min(2).regex(/^[a-z0-9-]+$/).openapi({ example: 'acme-corp' }),
          })
        }
      },
      required: true
    }
  },
  responses: {
    201: {
      content: { 'application/json': { schema: z.object({ organization: z.any() }) } },
      description: 'Organization created successfully'
    },
    401: { description: 'Unauthorized: authentication required' }
  }
});

// ─── Route: GET / (list organizations) ───────────────────────────────────────
const listOrgsRoute = createRoute({
  method: 'get',
  path: '/',
  summary: 'List organizations (Admin sees all, users see their own)',
  tags: ['Organizations'],
  middleware: [isAuthenticated],
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ organizations: z.array(z.any()) }) } },
      description: 'List of organizations'
    },
    401: { description: 'Unauthorized: authentication required' }
  }
});

// ─── Register Routes ─────────────────────────────────────────────────────────
orgRouter.openapi(listOrgsRoute, organizationController.list);
orgRouter.openapi(createOrgRoute, organizationController.create);
orgRouter.openapi(getProjectsRoute, organizationController.getProjects);
orgRouter.openapi(getMembersRoute, memberController.list);
orgRouter.openapi(inviteMemberRoute, memberController.invite);
orgRouter.openapi(removeMemberRoute, memberController.remove);
orgRouter.openapi(updateMemberRoleRoute, memberController.updateRole);
