import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { isAuthenticated } from '../../shared/middlewares/auth';
import { notificationController } from '../controllers/notificationController';

export const notificationsRouter = new OpenAPIHono();

notificationsRouter.use('*', isAuthenticated);

const listRoute = createRoute({
  method: 'get',
  path: '/',
  summary: 'List notifications for current user',
  tags: ['Notifications'],
  request: {
    query: z.object({
      limit: z.string().optional(),
      offset: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            notifications: z.array(z.object({
              id: z.string(),
              type: z.string(),
              title: z.string(),
              body: z.string().nullable(),
              formId: z.string().nullable(),
              testimonialId: z.string().nullable(),
              isRead: z.boolean(),
              createdAt: z.string().or(z.date()),
            })),
            unreadCount: z.number(),
          }),
        },
      },
      description: 'User notifications',
    },
    401: { description: 'Unauthorized' },
  },
});

const markReadRoute = createRoute({
  method: 'patch',
  path: '/:id/read',
  summary: 'Mark a notification as read',
  tags: ['Notifications'],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ success: z.boolean() }) } },
      description: 'Notification marked as read',
    },
    401: { description: 'Unauthorized' },
  },
});

const markAllReadRoute = createRoute({
  method: 'post',
  path: '/read-all',
  summary: 'Mark all notifications as read',
  tags: ['Notifications'],
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ success: z.boolean() }) } },
      description: 'All notifications marked as read',
    },
    401: { description: 'Unauthorized' },
  },
});

notificationsRouter.openapi(listRoute, notificationController.list);
notificationsRouter.openapi(markReadRoute, notificationController.markRead);
notificationsRouter.openapi(markAllReadRoute, notificationController.markAllRead);
