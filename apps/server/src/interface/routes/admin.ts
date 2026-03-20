import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { isSystemAdmin } from '../../shared/middlewares/rbac';
import { adminController } from '../controllers/adminController';

export const adminRouter = new OpenAPIHono();

// Apply System Admin protection to all routes in this router
adminRouter.use('*', isSystemAdmin);

const getUsersRoute = createRoute({
  method: 'get',
  path: '/users',
  summary: 'List all system users',
  tags: ['Admin'],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            users: z.array(z.any()),
            _metadata: z.object({
              message: z.string()
            })
          })
        }
      },
      description: 'List of users'
    }
  }
});

adminRouter.openapi(getUsersRoute, adminController.getUsers);
