import { ApiKey } from '../../../domain/entities/ApiKey';
import type { IApiKeyRepository } from '../../../domain/repositories/IApiKeyRepository';
import { ApiKeyGenerator } from '../../../shared/utils/ApiKeyGenerator';
import { randomUUID } from 'node:crypto';

export class GenerateUserApiKeys {
  constructor(private readonly apiKeyRepository: IApiKeyRepository) {}

  async execute(userId: string): Promise<{ publicKey: string; secretKey: string }> {
    // Check if user already has keys
    const existingKeys = await this.apiKeyRepository.findByUser(userId);
    
    let publicKey = existingKeys.find((k: ApiKey) => k.type === 'public' && k.getProps().isActive);
    let secretKey = existingKeys.find((k: ApiKey) => k.type === 'secret' && k.getProps().isActive);

    let publicKeyRaw: string | undefined;
    let secretKeyRaw: string | undefined;

    if (!publicKey) {
      const generated = ApiKeyGenerator.generate('public');
      publicKeyRaw = generated.rawKey;
      publicKey = new ApiKey({
        id: randomUUID(),
        userId,
        keyHash: generated.keyHash,
        keyPrefix: generated.keyPrefix,
        type: 'public',
        isActive: true,
      });
      await this.apiKeyRepository.save(publicKey);
    }

    if (!secretKey) {
      const generated = ApiKeyGenerator.generate('secret');
      secretKeyRaw = generated.rawKey;
      secretKey = new ApiKey({
        id: randomUUID(),
        userId,
        keyHash: generated.keyHash,
        keyPrefix: generated.keyPrefix,
        type: 'secret',
        isActive: true,
      });
      await this.apiKeyRepository.save(secretKey);
    }

    return {
      publicKey: publicKeyRaw || `${publicKey.getProps().keyPrefix}***`,
      secretKey: secretKeyRaw || `${secretKey.getProps().keyPrefix}***`,
    };
  }
}
