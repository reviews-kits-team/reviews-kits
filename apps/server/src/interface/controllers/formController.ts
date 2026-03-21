import type { Context } from 'hono';
import { container } from '@/infrastructure/container';
import { Form } from '@/domain/entities/Form';
import { Slug } from '@/domain/value-objects/Slug';
import { randomUUID } from 'node:crypto';

export const formController = {
  listForms: async (c: Context) => {
    const userId = c.get('userId') || (c.get('session') as any)?.user?.id;
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const forms = await container.formRepository.findByUser(userId);
    return c.json(forms.map(f => {
      const props = f.getProps();
      return { 
        ...props, 
        slug: props.slug.getValue(),
        responses: 0,
        rating: null,
        completion: 0
      };
    }));
  },

  createForm: async (c: Context) => {
    const userId = c.get('userId') || (c.get('session') as any)?.user?.id;
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { name, slug, description } = body;

    if (!name || !slug) {
      return c.json({ error: 'Name and Slug are required' }, 400);
    }

    const form = new Form({
      id: randomUUID(),
      userId,
      name,
      slug: Slug.create(slug),
      description,
      isActive: true,
    });

    try {
      await container.formRepository.save(form);
      const props = form.getProps();
      return c.json({ ...props, slug: props.slug.getValue() }, 201);
    } catch (err: any) {
      console.error("Failed to create form:", err);
      if (err.message?.includes('unique constraint') && err.message?.includes('slug')) {
        return c.json({ error: 'Ce slug est déjà utilisé par un autre formulaire.' }, 409);
      }
      return c.json({ error: err.message || 'Erreur lors de la création du formulaire' }, 500);
    }
  },

  getFormDetails: async (c: Context) => {
    const userId = c.get('userId') || (c.get('session') as any)?.user?.id;
    const formId = c.req.param('id');

    if (!userId || !formId) {
      return c.json({ error: 'Unauthorized or missing ID' }, 401);
    }

    const form = await container.formRepository.findById(formId);
    
    if (!form || !form.userId || form.userId !== userId) {
      return c.json({ error: 'Form not found' }, 404);
    }

    const props = form.getProps();
    return c.json({ 
      ...props, 
      slug: props.slug.getValue(),
      responses: 0,
      rating: null,
      completion: 0
    });
  },

  deleteForm: async (c: Context) => {
    const userId = c.get('userId') || (c.get('session') as any)?.user?.id;
    const formId = c.req.param('id');

    if (!userId || !formId) {
      return c.json({ error: 'Unauthorized or missing ID' }, 401);
    }

    const form = await container.formRepository.findById(formId);
    if (!form || form.userId !== userId) {
      return c.json({ error: 'Form not found' }, 404);
    }

    await container.formRepository.delete(formId);
    return c.json({ success: true });
  },

  toggleFormStatus: async (c: Context) => {
    const userId = c.get('userId') || (c.get('session') as any)?.user?.id;
    const formId = c.req.param('id');

    if (!userId || !formId) {
      return c.json({ error: 'Unauthorized or missing ID' }, 401);
    }

    const form = await container.formRepository.findById(formId);
    if (!form || form.userId !== userId) {
      return c.json({ error: 'Form not found' }, 404);
    }

    form.toggleActive();
    await container.formRepository.update(form);
    
    const props = form.getProps();
    return c.json({ ...props, slug: props.slug.getValue() });
  },

  duplicateForm: async (c: Context) => {
    const userId = c.get('userId') || (c.get('session') as any)?.user?.id;
    const formId = c.req.param('id');

    if (!userId || !formId) {
      return c.json({ error: 'Unauthorized or missing ID' }, 401);
    }

    const originalForm = await container.formRepository.findById(formId);
    if (!originalForm || originalForm.userId !== userId) {
      return c.json({ error: 'Form not found' }, 404);
    }

    const originalProps = originalForm.getProps();
    const newSlugValue = `${originalProps.slug.getValue()}-copy-${Date.now().toString().slice(-4)}`;
    
    const newForm = new Form({
      id: randomUUID(),
      userId,
      name: `${originalProps.name} (Copie)`,
      slug: Slug.create(newSlugValue),
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
};
