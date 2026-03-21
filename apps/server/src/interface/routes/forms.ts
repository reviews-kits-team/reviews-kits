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

const deleteFormRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  summary: 'Delete a form',
  tags: ['Forms'],
  responses: {
    200: { description: 'Form deleted' },
  },
});

const toggleFormStatusRoute = createRoute({
  method: 'patch',
  path: '/{id}/toggle',
  summary: 'Toggle form active status',
  tags: ['Forms'],
  responses: {
    200: { description: 'Status toggled' },
  },
});

const duplicateFormRoute = createRoute({
  method: 'post',
  path: '/{id}/duplicate',
  summary: 'Duplicate a form',
  tags: ['Forms'],
  responses: {
    201: { description: 'Form duplicated' },
  },
});

const batchToggleFormStatusRoute = createRoute({
  method: 'patch',
  path: '/batch-toggle',
  summary: 'Batch toggle forms status',
  tags: ['Forms'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            ids: z.array(z.string()),
            isActive: z.boolean(),
          }),
        },
      },
    },
  },
  responses: {
    200: { description: 'Status updated' },
  },
});

const batchDeleteFormsRoute = createRoute({
  method: 'delete',
  path: '/batch',
  summary: 'Batch delete forms',
  tags: ['Forms'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            ids: z.array(z.string()),
          }),
        },
      },
    },
  },
  responses: {
    200: { description: 'Forms deleted' },
  },
});

formsRouter.openapi(listFormsRoute, formController.listForms);
formsRouter.openapi(createFormRoute, formController.createForm);
formsRouter.openapi(batchToggleFormStatusRoute, formController.batchToggleStatus);
formsRouter.openapi(batchDeleteFormsRoute, formController.batchDeleteForms);
formsRouter.openapi(deleteFormRoute, formController.deleteForm);
formsRouter.openapi(toggleFormStatusRoute, formController.toggleFormStatus);
formsRouter.openapi(duplicateFormRoute, formController.duplicateForm);
