import type { IUserRepository } from '../../../domain/repositories/UserRepository';
import type { UserProps } from '../../../domain/entities/User';

export class ListUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<UserProps[]> {
    const users = await this.userRepository.findAll();
    return users.map(user => user.getProps());
  }
}
