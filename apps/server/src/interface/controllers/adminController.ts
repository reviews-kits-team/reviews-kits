import type { Context } from 'hono';
import { DrizzleUserRepository } from '../../infrastructure/repositories/DrizzleUserRepository';
import { ListUsersUseCase } from '../../application/use-cases/admin/ListUsersUseCase';

// Initialize repository and use case
const userRepository = new DrizzleUserRepository();
const listUsersUseCase = new ListUsersUseCase(userRepository);

export const adminController = {
  /**
   * List all system users using the dedicated Use Case
   */
  getUsers: async (c: Context) => {
    const users = await listUsersUseCase.execute();
    
    return c.json({ 
      users,
      _metadata: {
        message: "Successfully retrieved all users via Use Case"
      }
    }, 200 as const);
  }
};
