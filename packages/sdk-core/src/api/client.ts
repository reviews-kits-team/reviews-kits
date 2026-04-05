import { fetcher } from '../utils/fetcher';
import type { ReviewsKitConfig } from '@reviewskits/types';

export const apiClient = {
  get: <T>(path: string, options?: RequestInit, config?: ReviewsKitConfig, tags: string[] = []) =>
    fetcher<T>(path, { ...options, method: 'GET' }, config, tags),
};
