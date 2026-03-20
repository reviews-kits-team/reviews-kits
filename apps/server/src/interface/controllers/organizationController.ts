import type { Context } from 'hono';
import { auth } from '../../infrastructure/auth/auth';
import { db } from '../../infrastructure/database/db';
import { DrizzleOrganizationRepository } from '../../infrastructure/repositories/DrizzleOrganizationRepository';
import { ListOrganizationsUseCase } from '../../application/use-cases/organization/ListOrganizationsUseCase';
import { CreateOrganizationUseCase } from '../../application/use-cases/organization/CreateOrganizationUseCase';

const organizationRepository = new DrizzleOrganizationRepository(db);
const listOrganizationsUseCase = new ListOrganizationsUseCase(organizationRepository);
const createOrganizationUseCase = new CreateOrganizationUseCase();

export const organizationController = {
  /**
   * GET /api/v1/organizations
   * List organizations using ListOrganizationsUseCase.
   */
  list: async (c: Context) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json({ error: 'Unauthorized' }, 401);

    const organizations = await listOrganizationsUseCase.execute(
      session.user.id,
      session.user.isSystemAdmin
    );

    return c.json({ organizations }, 200 as const);
  },

  /**
   * POST /api/v1/organizations
   * Create a new organization via Better-Auth.
   * Any authenticated user can create an organization (they become the owner).
   */
  create: async (c: Context) => {
    const { name, slug } = await c.req.json();

    const organization = await createOrganizationUseCase.execute(
      name,
      slug,
      c.req.raw.headers
    );

    return c.json({ organization }, 201 as const);
  },

  /**
   * GET /:organizationId/projects
   * Placeholder to list all projects for a specific organization.
   */
  getProjects: async (c: Context) => {
    const organizationId = c.req.param('organizationId')!;
    return c.json({ 
      organizationId,
      projects: [],
      _metadata: {
        message: "This is an Organization protected route (Member only)"
      }
    }, 200 as const);
  }
};
