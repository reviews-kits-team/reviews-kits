import { fetcher } from '../utils/fetcher';
import type { ReviewsKitConfig } from '../core/config';

export const apiClient = {
  get: <T>(path: string, options?: RequestInit, config?: ReviewsKitConfig) =>
    fetcher<T>(path, { ...options, method: 'GET' }, config),
};
