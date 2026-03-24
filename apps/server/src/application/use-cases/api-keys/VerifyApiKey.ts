import type { IApiKeyRepository } from '../../../domain/repositories/IApiKeyRepository';
import type { ApiKey } from '../../../domain/entities/ApiKey';
import { createHash } from 'node:crypto';

export class VerifyApiKey {
  constructor(private readonly apiKeyRepository: IApiKeyRepository) {}

  async execute(keyStr: string): Promise<ApiKey | null> {
    const keyHash = createHash('sha256').update(keyStr).digest('hex');
    const apiKey = await this.apiKeyRepository.findByHash(keyHash);

    if (!apiKey || !apiKey.getProps().isActive) {
      return null;
    }

    return apiKey;
  }
}
