import { fetcher } from '../utils/fetcher';

export const apiClient = {
  get: <T>(path: string, options?: RequestInit) =>
    fetcher<T>(path, { ...options, method: 'GET' }),
};
