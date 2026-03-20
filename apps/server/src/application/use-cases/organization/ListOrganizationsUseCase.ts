import type { OrganizationRepository, OrganizationWithRole } from '../../../domain/repositories/OrganizationRepository';

export class ListOrganizationsUseCase {
  constructor(private readonly organizationRepository: OrganizationRepository) { }

  async execute(userId: string, isSystemAdmin: boolean): Promise<any[]> {
    // Return only organizations where the user is an explicit member
    return this.organizationRepository.findByUserId(userId);
  }
}
