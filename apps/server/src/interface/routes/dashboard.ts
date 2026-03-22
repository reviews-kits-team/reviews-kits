import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { isAuthenticated } from '../../shared/middlewares/auth';
import { dashboardController } from '../controllers/dashboardController';

export const dashboardRouter = new OpenAPIHono();

// Apply Authentication protection
dashboardRouter.use('*', isAuthenticated);

const getStatsRoute = createRoute({
  method: 'get',
  path: '/stats',
  summary: 'Get dashboard statistics for the current user',
  tags: ['Dashboard'],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            totalReviews: z.number(),
            averageRating: z.number(),
            uniqueRespondents: z.number(),
            completionRate: z.number(),
          })
        }
      },
      description: 'Dashboard statistics'
    },
    401: {
      description: 'Unauthorized'
    }
  }
});

dashboardRouter.openapi(getStatsRoute, dashboardController.getStats);
