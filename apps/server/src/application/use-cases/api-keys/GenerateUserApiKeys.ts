import { ApiKey } from '../../../domain/entities/ApiKey';
import type { ApiKeyRepository } from '../../../domain/repositories/ApiKeyRepository';
import { ApiKeyGenerator } from '../../../shared/utils/ApiKeyGenerator';
import { randomUUID } from 'node:crypto';

export class GenerateUserApiKeys {
  constructor(private readonly apiKeyRepository: ApiKeyRepository) {}

  async execute(userId: string): Promise<{ publicKey: string; secretKey: string }> {
    // Check if user already has keys
    const existingKeys = await this.apiKeyRepository.findByUser(userId);
    
    let publicKey = existingKeys.find((k: ApiKey) => k.type === 'public' && k.getProps().isActive);
    let secretKey = existingKeys.find((k: ApiKey) => k.type === 'secret' && k.getProps().isActive);

    if (!publicKey) {
      const keyStr = ApiKeyGenerator.generate('public');
      publicKey = new ApiKey({
        id: randomUUID(),
        userId,
        key: keyStr,
        type: 'public',
        isActive: true,
      });
      await this.apiKeyRepository.save(publicKey);
    }

    if (!secretKey) {
      const keyStr = ApiKeyGenerator.generate('secret');
      secretKey = new ApiKey({
        id: randomUUID(),
        userId,
        key: keyStr,
        type: 'secret',
        isActive: true,
      });
      await this.apiKeyRepository.save(secretKey);
    }

    return {
      publicKey: publicKey.key,
      secretKey: secretKey.key,
    };
  }
}
