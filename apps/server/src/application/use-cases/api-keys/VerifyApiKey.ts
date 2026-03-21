import type { ApiKeyRepository } from '../../../domain/repositories/ApiKeyRepository';
import type { ApiKey } from '../../../domain/entities/ApiKey';

export class VerifyApiKey {
  constructor(private readonly apiKeyRepository: ApiKeyRepository) {}

  async execute(keyStr: string): Promise<ApiKey | null> {
    const apiKey = await this.apiKeyRepository.findByKey(keyStr);

    if (!apiKey || !apiKey.getProps().isActive) {
      return null;
    }

    return apiKey;
  }
}
