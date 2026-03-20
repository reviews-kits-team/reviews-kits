import { auth } from '../../../infrastructure/auth/auth';

export class CreateOrganizationUseCase {
  async execute(name: string, slug: string, headers: Headers) {
    return auth.api.createOrganization({
      headers,
      body: { name, slug },
    });
  }
}
