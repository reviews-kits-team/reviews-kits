import type { MemberRepository, MemberDetails } from '../../../domain/repositories/MemberRepository';

export class ListMembersUseCase {
  constructor(private readonly memberRepository: MemberRepository) {}

  async execute(organizationId: string): Promise<MemberDetails[]> {
    return this.memberRepository.findByOrganizationId(organizationId);
  }
}
