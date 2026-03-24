import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { isAuthenticated } from '../../shared/middlewares/auth';
import { meController } from '../controllers/meController';

export const meRouter = new OpenAPIHono();

// Apply Authentication protection to this router
meRouter.use('*', isAuthenticated);

const getMeRoute = createRoute({
  method: 'get',
  path: '/',
  summary: 'Get current user session and identity',
  tags: ['Profile'],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            user: z.object({
              id: z.string(),
              email: z.email(),
              name: z.string(),
              emailVerified: z.boolean(),
              image: z.string().nullable().optional(),
              isSystemAdmin: z.boolean().default(false),
              createdAt: z.string().or(z.date()),
              updatedAt: z.string().or(z.date()),
            }),
            session: z.object({
              id: z.string(),
              userId: z.string(),
              expiresAt: z.string().or(z.date()),
              token: z.string().optional(),
              ipAddress: z.string().nullable().optional(),
              userAgent: z.string().nullable().optional(),
              createdAt: z.string().or(z.date()),
              updatedAt: z.string().or(z.date()),
            })
          })
        }
      },
      description: 'The current user and session'
    },
    401: {
      description: 'Unauthorized: No valid session found'
    }
  }
});

const updateMeRoute = createRoute({
  method: 'patch',
  path: '/',
  summary: 'Update current user profile info',
  tags: ['Profile'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().optional(),
            email: z.string().email().optional(),
            avatarUrl: z.string().nullable().optional()
          })
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean()
          })
        }
      },
      description: 'Successfully updated profile'
    },
    400: { description: 'Bad request' },
    401: { description: 'Unauthorized' }
  }
});

meRouter.openapi(getMeRoute, meController.getMe);
meRouter.openapi(updateMeRoute, meController.updateMe);
