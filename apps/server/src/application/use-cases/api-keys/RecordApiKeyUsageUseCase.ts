import type { IApiKeyRepository } from '../../../domain/repositories/IApiKeyRepository';
import type { ApiKey } from '../../../domain/entities/ApiKey';

export class RecordApiKeyUsageUseCase {
  constructor(private readonly apiKeyRepository: IApiKeyRepository) {}

  async execute(apiKey: ApiKey): Promise<void> {
    apiKey.updateLastUsed();
    await this.apiKeyRepository.update(apiKey);
  }
}
