import { createHash } from 'node:crypto';
import type { IApiKeyRepository } from '../../../domain/repositories/IApiKeyRepository';
import type { ApiKey } from '../../../domain/entities/ApiKey';

export class VerifyPublicApiKeyUseCase {
  constructor(private readonly apiKeyRepository: IApiKeyRepository) {}

  async execute(rawKey: string): Promise<ApiKey | null> {
    const keyHash = createHash('sha256').update(rawKey).digest('hex');
    const keyRecord = await this.apiKeyRepository.findByHash(keyHash);

    if (!keyRecord) return null;

    const props = keyRecord.getProps();
    if (props.type !== 'public' || !props.isActive) return null;

    return keyRecord;
  }
}
