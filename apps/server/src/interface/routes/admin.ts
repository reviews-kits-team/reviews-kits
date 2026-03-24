import { OpenAPIHono } from '@hono/zod-openapi';
import { isSystemAdmin } from '../../shared/middlewares/rbac';

export const adminRouter = new OpenAPIHono();

// Apply System Admin protection to all routes in this router
adminRouter.use('*', isSystemAdmin);

// adminRouter.openapi(getUsersRoute, adminController.getUsers);
