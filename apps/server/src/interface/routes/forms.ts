import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { isAuthenticated } from '../../shared/middlewares/auth';
import { formController } from '../controllers/formController';

export const formsRouter = new OpenAPIHono();

// Apply Authentication protection (Session based for Admin UI)
formsRouter.use('*', isAuthenticated);

const listFormsRoute = createRoute({
  method: 'get',
  path: '/',
  summary: 'List all forms for the current user',
  tags: ['Forms'],
  responses: {
    200: {
      description: 'List of forms',
    },
  },
});

const createFormRoute = createRoute({
  method: 'post',
  path: '/',
  summary: 'Create a new form',
  tags: ['Forms'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().min(1),
            slug: z.string().min(1),
            description: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Form created',
    },
  },
});

formsRouter.openapi(listFormsRoute, formController.listForms);
formsRouter.openapi(createFormRoute, formController.createForm);
