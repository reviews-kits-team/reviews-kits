import { Form } from '../entities/Form';

export interface FormRepository {
  findById(id: string): Promise<Form | null>;
  findBySlug(projectId: string, slug: string): Promise<Form | null>;
  findByProject(projectId: string): Promise<Form[]>;
  save(form: Form): Promise<void>;
  update(form: Form): Promise<void>;
  delete(id: string): Promise<void>;
}
