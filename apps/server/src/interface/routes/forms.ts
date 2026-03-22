import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { isAuthenticated } from '../../shared/middlewares/auth';
import { formController } from '../controllers/formController';

export const formsRouter = new OpenAPIHono();

// Apply Authentication protection (Session based for Admin UI)
formsRouter.use('*', isAuthenticated);

const getFormRoute = createRoute({
  method: 'get',
  path: '/{id}',
  summary: 'Get form details',
  tags: ['Forms'],
  responses: {
    200: { description: 'Form details' },
    404: { description: 'Form not found' }
  }
});

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

const getFormStatsRoute = createRoute({
  method: 'get',
  path: '/{id}/stats',
  summary: 'Get form statistics',
  tags: ['Forms'],
  responses: {
    200: { description: 'Form statistics' },
  },
});

const getFormTestimonialsRoute = createRoute({
  method: 'get',
  path: '/{id}/testimonials',
  summary: 'Get form testimonials',
  tags: ['Forms'],
  responses: {
    200: { description: 'List of testimonials for the form' },
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

const updateFormRoute = createRoute({
  method: 'patch',
  path: '/{id}',
  summary: 'Update form configuration',
  tags: ['Forms'],
  request: {
    params: z.object({
      id: z.string()
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            config: z.any().optional(),
            isActive: z.boolean().optional()
          })
        }
      }
    }
  },
  responses: {
    200: { description: 'Form updated' },
    401: { description: 'Unauthorized' },
    404: { description: 'Form not found' }
  }
});

formsRouter.openapi(listFormsRoute, formController.listForms);
formsRouter.openapi(getFormRoute, formController.getFormDetails);
formsRouter.openapi(createFormRoute, formController.createForm);
formsRouter.openapi(updateFormRoute, formController.updateForm as any);
formsRouter.openapi(batchToggleFormStatusRoute, formController.batchToggleStatus);
formsRouter.openapi(batchDeleteFormsRoute, formController.batchDeleteForms);
formsRouter.openapi(getFormStatsRoute, formController.getFormStats);
formsRouter.openapi(getFormTestimonialsRoute, formController.getFormTestimonials);
formsRouter.openapi(deleteFormRoute, formController.deleteForm);
formsRouter.openapi(toggleFormStatusRoute, formController.toggleFormStatus);
formsRouter.openapi(duplicateFormRoute, formController.duplicateForm);
