import { NotFoundError } from '../../../domain/errors/NotFoundError';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import type { NotificationPrefs } from '../../../domain/entities/User';

export interface UpdateUserRequest {
  id: string;
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  notificationPrefs?: Partial<NotificationPrefs>;
}

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(request: UpdateUserRequest): Promise<void> {
    const { id, name, email, avatarUrl, notificationPrefs } = request;

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
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

    if (notificationPrefs) {
      user.updateNotificationPrefs(notificationPrefs);
    }

    await this.userRepository.update(user);
  }
}
