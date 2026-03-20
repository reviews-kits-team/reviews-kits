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

meRouter.openapi(getMeRoute, meController.getMe);
