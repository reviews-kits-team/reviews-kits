import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { isAuthenticated } from '../../shared/middlewares/auth';
import { testimonialController } from '../controllers/testimonialController';

export const testimonialsRouter = new OpenAPIHono();

// Apply Authentication protection
testimonialsRouter.use('*', isAuthenticated);

const updateStatusRoute = createRoute({
  method: 'patch',
  path: '/{id}/status',
  summary: 'Update testimonial status',
  tags: ['Testimonials'],
  request: {
    params: z.object({
      id: z.string()
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.enum(['approved', 'rejected', 'pending'])
          })
        }
      }
    }
  },
  responses: {
    200: { description: 'Status updated' },
    401: { description: 'Unauthorized' },
    404: { description: 'Testimonial not found' }
  }
});


const batchUpdateStatusRoute = createRoute({
  method: 'post',
  path: '/batch-status',
  summary: 'Batch update testimonial status',
  tags: ['Testimonials'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            ids: z.array(z.string()),
            status: z.enum(['approved', 'rejected', 'pending'])
          })
        }
      }
    }
  },
  responses: {
    200: { description: 'Batch update successful' },
    401: { description: 'Unauthorized' }
  }
});


const reorderTestimonialsRoute = createRoute({
  method: 'post',
  path: '/reorder',
  summary: 'Reorder testimonials',
  tags: ['Testimonials'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            positions: z.array(z.object({
              id: z.string(),
              position: z.number()
            }))
          })
        }
      }
    }
  },
  responses: {
    200: { description: 'Reordering successful' },
    401: { description: 'Unauthorized' }
  }
});

testimonialsRouter.openapi(updateStatusRoute, testimonialController.updateStatus as any);
testimonialsRouter.openapi(batchUpdateStatusRoute, testimonialController.batchUpdateStatus as any);
testimonialsRouter.openapi(reorderTestimonialsRoute, testimonialController.reorderTestimonials as any);
