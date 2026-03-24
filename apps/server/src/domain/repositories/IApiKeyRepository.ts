import { ApiKey } from '../entities/ApiKey';

export interface IApiKeyRepository {
  findById(id: string): Promise<ApiKey | null>;
  findByHash(keyHash: string): Promise<ApiKey | null>;
  findByUser(userId: string): Promise<ApiKey[]>;
  save(apiKey: ApiKey): Promise<void>;
  update(apiKey: ApiKey): Promise<void>;
  delete(id: string): Promise<void>;
}
