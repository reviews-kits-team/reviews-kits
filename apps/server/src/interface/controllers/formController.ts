import type { Context } from 'hono';
import { getUserIdFromContext } from '@/shared/utils/auth';
import { container } from '@/infrastructure/container';
import { SlugAlreadyInUseError } from '@/domain/errors/SlugAlreadyInUseError';
import { NotFoundError } from '@/domain/errors/NotFoundError';

export const formController = {
  listForms: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
      const forms = await container.listFormsUseCase.execute(userId);
      return c.json(forms);
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  },

  createForm: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json() as { name: string, slug: string, description?: string };
    const { name, slug, description } = body;

    try {
      const form = await container.createFormUseCase.execute({ userId, name, slug, description });
      const props = form.getProps();
      return c.json({ ...props, slug: props.slug.getValue() }, 201);
    } catch (err: any) {
      if (err instanceof SlugAlreadyInUseError) return c.json({ error: err.message }, 409);
      return c.json({ error: err.message || 'Error occurred while creating the form' }, 500);
    }
  },

  getFormDetails: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    const formId = c.req.param('id');

    if (!userId || !formId) {
      return c.json({ error: 'Unauthorized or missing ID' }, 401);
    }

    try {
      const result = await container.getFormDetailsUseCase.execute({ id: formId, userId });
      return c.json(result);
    } catch (err: any) {
      const status = err instanceof NotFoundError ? 404 : 500;
      return c.json({ error: err.message }, status);
    }
  },

  deleteForm: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    const formId = c.req.param('id');

    if (!userId || !formId) {
      return c.json({ error: 'Unauthorized or missing ID' }, 401);
    }

    try {
      await container.deleteFormUseCase.execute({ id: formId, userId });
      return c.json({ success: true });
    } catch (err: any) {
      const status = err instanceof NotFoundError ? 404 : 500;
      return c.json({ error: err.message }, status);
    }
  },

  updateForm: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    const formId = c.req.param('id');
    const body = await c.req.json();
    const { name, description, config, isActive } = body;

    if (!userId || !formId) {
      return c.json({ error: 'Unauthorized or missing ID' }, 401);
    }

    try {
      const form = await container.updateFormUseCase.execute({
        id: formId,
        userId,
        name,
        description,
        config,
        isActive
      });
      const props = form.getProps();
      return c.json({ ...props, slug: props.slug.getValue() });
    } catch (err: any) {
      const status = err instanceof NotFoundError ? 404 : 500;
      return c.json({ error: err.message }, status);
    }
  },

  toggleFormStatus: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    const formId = c.req.param('id');

    if (!userId || !formId) {
      return c.json({ error: 'Unauthorized or missing ID' }, 401);
    }

    try {
      const form = await container.toggleFormStatusUseCase.execute({ id: formId, userId });
      const props = form.getProps();
      return c.json({ ...props, slug: props.slug.getValue() });
    } catch (err: any) {
      const status = err instanceof NotFoundError ? 404 : 500;
      return c.json({ error: err.message }, status);
    }
  },

  duplicateForm: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    const formId = c.req.param('id');

    if (!userId || !formId) {
      return c.json({ error: 'Unauthorized or missing ID' }, 401);
    }

    try {
      const form = await container.duplicateFormUseCase.execute({ id: formId, userId });
      const props = form.getProps();
      return c.json({ ...props, slug: props.slug.getValue() }, 201);
    } catch (err: any) {
      const status = err instanceof NotFoundError ? 404 : 500;
      return c.json({ error: err.message }, status);
    }
  },

  batchToggleStatus: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { ids, isActive } = await c.req.json() as { ids: string[], isActive: boolean };
    if (!Array.isArray(ids) || ids.length === 0) {
      return c.json({ error: 'Invalid form IDs' }, 400);
    }

    try {
      await container.batchToggleFormStatusUseCase.execute({ ids, userId, isActive });
      return c.json({ success: true, isActive });
    } catch (err: any) {
      return c.json({ error: err.message }, 403);
    }
  },

  batchDeleteForms: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { ids } = await c.req.json() as { ids: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      return c.json({ error: 'Invalid form IDs' }, 400);
    }

    try {
      await container.batchDeleteFormsUseCase.execute({ ids, userId });
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ error: err.message }, 403);
    }
  },

  getFormStats: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    const formId = c.req.param('id');

    if (!userId || !formId) {
      return c.json({ error: 'Unauthorized or missing ID' }, 401);
    }

    try {
      const stats = await container.getFormStatsUseCase.execute({ id: formId, userId });
      return c.json(stats);
    } catch (err: any) {
      const status = err instanceof NotFoundError ? 404 : 500;
      return c.json({ error: err.message }, status);
    }
  },

  getFormTestimonials: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    const formId = c.req.param('id');
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = 10;

    if (!userId || !formId) {
      return c.json({ error: 'Unauthorized or missing ID' }, 401);
    }

    const sort = c.req.query('sort') || 'createdAt';
    const order = (c.req.query('order') || 'desc') as 'asc' | 'desc';
    const consentPublicParam = c.req.query('consentPublic');
    const consentPublic = consentPublicParam ? consentPublicParam === 'true' : undefined;

    try {
      const testimonials = await container.getFormTestimonialsUseCase.execute({
        id: formId,
        userId,
        page,
        limit,
        sort,
        order,
        consentPublic
      });
      return c.json(testimonials);
    } catch (err: any) {
      const status = err instanceof NotFoundError ? 404 : 500;
      return c.json({ error: err.message }, status);
    }
  },
};
