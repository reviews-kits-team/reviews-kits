import { Organization } from '../entities/Organization';

export interface OrganizationWithRole {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  createdAt: Date;
  role: string;
}

export interface OrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  findAll(): Promise<Organization[]>;
  findByUserId(userId: string): Promise<OrganizationWithRole[]>;
  save(organization: Organization): Promise<void>;
  update(organization: Organization): Promise<void>;
  delete(id: string): Promise<void>;
}
