import { Project } from '../entities/Project';

export interface ProjectRepository {
  findById(id: string): Promise<Project | null>;
  findBySlug(slug: string): Promise<Project | null>;
  findByOrganization(organizationId: string): Promise<Project[]>;
  save(project: Project): Promise<void>;
  update(project: Project): Promise<void>;
  delete(id: string): Promise<void>;
}
