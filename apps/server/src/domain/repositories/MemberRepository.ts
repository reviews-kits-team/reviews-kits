export interface MemberDetails {
  id: string;
  role: string;
  createdAt: Date;
  userId: string;
  userName: string;
  userEmail: string;
}

export interface MemberRepository {
  findByOrganizationId(organizationId: string): Promise<MemberDetails[]>;
}
