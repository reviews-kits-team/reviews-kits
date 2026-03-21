import { ApiKey } from '../entities/ApiKey';

export interface ApiKeyRepository {
  findById(id: string): Promise<ApiKey | null>;
  findByKey(key: string): Promise<ApiKey | null>;
  findByUser(userId: string): Promise<ApiKey[]>;
  save(apiKey: ApiKey): Promise<void>;
  update(apiKey: ApiKey): Promise<void>;
  delete(id: string): Promise<void>;
}
