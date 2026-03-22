import { Form } from '../entities/Form';

export interface FormRepository {
  findById(id: string): Promise<Form | null>;
  findBySlug(slug: string): Promise<Form | null>;
  findByPublicId(publicId: string): Promise<Form | null>;
  findByUser(userId: string): Promise<Form[]>;
  save(form: Form): Promise<void>;
  update(form: Form): Promise<void>;
  delete(id: string): Promise<void>;
  batchUpdateStatus(ids: string[], isActive: boolean): Promise<void>;
  batchDelete(ids: string[]): Promise<void>;
  incrementVisits(formId: string): Promise<void>;
}
