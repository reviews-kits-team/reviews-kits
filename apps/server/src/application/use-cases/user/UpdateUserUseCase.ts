import type { IUserRepository } from '../../../domain/repositories/IUserRepository';

export interface UpdateUserRequest {
  id: string;
  name?: string;
  email?: string;
  avatarUrl?: string | null;
}

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(request: UpdateUserRequest): Promise<void> {
    const { id, name, email, avatarUrl } = request;

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (name) {
      user.updateName(name);
    }

    if (email) {
      user.updateEmail(email);
    }

    if (avatarUrl !== undefined) {
      user.updateAvatar(avatarUrl);
    }

    await this.userRepository.update(user);
  }
}
