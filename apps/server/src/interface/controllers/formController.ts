import type { Context } from 'hono';
import { getUserIdFromContext } from '@/shared/utils/auth';
import { container } from '@/infrastructure/container';
import { Form } from '@/domain/entities/Form';
import { Slug } from '@/domain/value-objects/Slug';
import { randomUUID } from 'node:crypto';
import { ApiKeyGenerator } from '@/shared/utils/ApiKeyGenerator';

export const formController = {
  listForms: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const forms = await container.formRepository.findByUser(userId);
    
    const formIds = forms.map(f => f.getProps().id);
    const [statsMap, visitsMap] = await Promise.all([
      container.testimonialRepository.getBasicStatsByFormIds(formIds),
      container.formRepository.getVisitsByFormIds(formIds)
    ]);

    const formsWithStats = forms.map(f => {
      const props = f.getProps();
      const stats = statsMap.get(props.id) || { totalReviews: 0, averageRating: 0 };
      const visits = visitsMap.get(props.id) || 0;
      
      let completion = 0;
      if (visits > 0) {
        completion = Math.min(100, Math.round((stats.totalReviews / visits) * 100));
      }

      return { 
        ...props, 
        slug: props.slug.getValue(),
        publicId: props.publicId,
        responses: stats.totalReviews,
        rating: stats.averageRating,
        completion
      };
    });
    
    return c.json(formsWithStats);
  },

  createForm: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json() as { name: string, slug: string, description?: string };
    const { name, slug, description } = body;

    if (!name || !slug) {
      return c.json({ error: 'Name and Slug are required' }, 400);
    }

    const form = new Form({
      id: randomUUID(),
      userId,
      name,
      slug: Slug.create(slug),
      publicId: ApiKeyGenerator.generatePublicId('frm'),
      description,
      isActive: true,
    });

    try {
      await container.formRepository.save(form);
      const props = form.getProps();
      return c.json({ ...props, slug: props.slug.getValue() }, 201);
    } catch (err: unknown) {
      console.error("Failed to create form:", err);
      const message = err instanceof Error ? err.message : '';
      if (message.includes('unique constraint') && message.includes('slug')) {
        return c.json({ error: 'This slug is already in use by another form.' }, 409);
      }
      return c.json({ error: message || 'Error occurred while creating the form' }, 500);
    }
  },

  getFormDetails: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    const formId = c.req.param('id');

    if (!userId || !formId) {
      return c.json({ error: 'Unauthorized or missing ID' }, 401);
    }

    const form = await container.formRepository.findById(formId);
    
    if (!form || form.getUserId() !== userId) {
      return c.json({ error: 'Form not found' }, 404);
    }

    const props = form.getProps();
    const [stats, visitsMap] = await Promise.all([
      container.testimonialRepository.getStatsByFormId(props.id),
      container.formRepository.getVisitsByFormIds([props.id])
    ]);
    
    const visits = visitsMap.get(props.id) || 0;
    let completion = 0;
    if (visits > 0) {
      completion = Math.min(100, Math.round((stats.totalReviews / visits) * 100));
    }

    return c.json({ 
      ...props, 
      slug: props.slug.getValue(),
      responses: stats.totalReviews,
      rating: stats.averageRating,
      completion
    });
  },

  deleteForm: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    const formId = c.req.param('id');

    if (!userId || !formId) {
      return c.json({ error: 'Unauthorized or missing ID' }, 401);
    }

    const form = await container.formRepository.findById(formId);
    if (!form || form.getUserId() !== userId) {
      return c.json({ error: 'Form not found' }, 404);
    }

    await container.formRepository.delete(formId);
    return c.json({ success: true });
  },

  updateForm: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    const formId = c.req.param('id');
    const body = await c.req.json();
    const { name, description, config, isActive } = body;

    if (!userId || !formId) {
      return c.json({ error: 'Unauthorized or missing ID' }, 401);
    }

    const form = await container.formRepository.findById(formId);
    if (!form || form.getUserId() !== userId) {
      return c.json({ error: 'Form not found' }, 404);
    }

    if (name) form.updateName(name);
    if (description !== undefined) form.updateDescription(description);
    if (config) form.updateConfig(config);
    if (isActive !== undefined) form.updateIsActive(isActive);

    await container.formRepository.update(form);
    
    const props = form.getProps();
    return c.json({ ...props, slug: props.slug.getValue() });
  },

  toggleFormStatus: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    const formId = c.req.param('id');

    if (!userId || !formId) {
      return c.json({ error: 'Unauthorized or missing ID' }, 401);
    }

    const form = await container.formRepository.findById(formId);
    if (!form || form.getUserId() !== userId) {
      return c.json({ error: 'Form not found' }, 404);
    }

    form.toggleActive();
    await container.formRepository.update(form);
    
    const props = form.getProps();
    return c.json({ ...props, slug: props.slug.getValue() });
  },

  duplicateForm: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    const formId = c.req.param('id');

    if (!userId || !formId) {
      return c.json({ error: 'Unauthorized or missing ID' }, 401);
    }

    const originalForm = await container.formRepository.findById(formId);
    if (!originalForm || originalForm.getUserId() !== userId) {
      return c.json({ error: 'Form not found' }, 404);
    }

    const originalProps = originalForm.getProps();
    const newSlugValue = `${originalProps.slug.getValue()}-copy-${Date.now().toString().slice(-4)}`;
    
    const newForm = new Form({
      id: randomUUID(),
      userId,
      name: `${originalProps.name} (Copie)`,
      slug: Slug.create(newSlugValue),
      publicId: ApiKeyGenerator.generatePublicId('frm'),
      description: originalProps.description,
      thankYouMessage: originalProps.thankYouMessage,
      config: originalProps.config,
      accentColor: originalProps.accentColor,
      isActive: originalProps.isActive,
    });

    await container.formRepository.save(newForm);
    const props = newForm.getProps();
    return c.json({ ...props, slug: props.slug.getValue() }, 201);
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
      const owned = await container.formRepository.findByIdsAndUser(ids, userId);
      if (owned.length !== ids.length) {
        return c.json({ error: 'Forbidden: one or more forms do not belong to you' }, 403);
      }

      await container.formRepository.batchUpdateStatus(ids, isActive);
      return c.json({ success: true, isActive });
    } catch (err: unknown) {
      console.error("Failed to batch toggle form status:", err);
      return c.json({ error: 'Error during batch update' }, 500);
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
      const owned = await container.formRepository.findByIdsAndUser(ids, userId);
      if (owned.length !== ids.length) {
        return c.json({ error: 'Forbidden: one or more forms do not belong to you' }, 403);
      }

      await container.formRepository.batchDelete(ids);
      return c.json({ success: true });
    } catch (err: unknown) {
      console.error("Failed to batch delete forms:", err);
      return c.json({ error: 'Error during batch deletion' }, 500);
    }
  },

  getFormStats: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    const formId = c.req.param('id');

    if (!userId || !formId) {
      return c.json({ error: 'Unauthorized or missing ID' }, 401);
    }

    // Verify ownership
    const form = await container.formRepository.findById(formId);
    if (!form || form.getUserId() !== userId) {
      return c.json({ error: 'Form not found' }, 404);
    }

    const stats = await container.testimonialRepository.getStatsByFormId(formId);
    return c.json(stats);
  },

  getFormTestimonials: async (c: Context) => {
    const userId = getUserIdFromContext(c);
    const formId = c.req.param('id');
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = 10;
    const offset = (page - 1) * limit;

    if (!userId || !formId) {
      return c.json({ error: 'Unauthorized or missing ID' }, 401);
    }

    // Verify ownership
    const form = await container.formRepository.findById(formId);
    if (!form || form.getUserId() !== userId) {
      return c.json({ error: 'Form not found' }, 404);
    }

    const sort = c.req.query('sort') || 'createdAt';
    const order = (c.req.query('order') || 'desc') as 'asc' | 'desc';

    const testimonials = await container.testimonialRepository.findByFormId(formId, { 
      limit, 
      offset, 
      sort, 
      order 
    });
    return c.json(testimonials.map(t => {
      const props = t.getProps();
      return {
        ...props,
        rating: props.rating?.getValue(),
        authorEmail: props.authorEmail?.getValue()
      };
    }));
  },
};
