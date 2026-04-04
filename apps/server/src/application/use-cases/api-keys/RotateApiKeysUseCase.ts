import type { IApiKeyRepository } from '../../../domain/repositories/IApiKeyRepository';
import { GenerateUserApiKeys } from './GenerateUserApiKeys';

export class RotateApiKeysUseCase {
  private readonly generateUserApiKeys: GenerateUserApiKeys;

  constructor(private readonly apiKeyRepository: IApiKeyRepository) {
    this.generateUserApiKeys = new GenerateUserApiKeys(apiKeyRepository);
  }

  async execute(userId: string): Promise<{ publicKey: string; secretKey: string }> {
    const keys = await this.apiKeyRepository.findByUser(userId);
    for (const key of keys) {
      key.deactivate();
      await this.apiKeyRepository.update(key);
    }
    return this.generateUserApiKeys.execute(userId);
  }
}
