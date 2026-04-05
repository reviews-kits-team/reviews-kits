import type { CacheAdapter } from '@reviewskits/types';

/**
 * Standard in-memory cache adapter using a JS Map.
 */
export class InMemoryCacheAdapter implements CacheAdapter {
  private cache = new Map<string, { value: any; expiry: number | null; tags: string[] }>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set<T>(key: string, value: T, ttl?: number, tags: string[] = []): Promise<void> {
    const expiry = ttl ? Date.now() + ttl * 1000 : null;
    this.cache.set(key, { value, expiry, tags });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async invalidateTags(tags: string[]): Promise<void> {
    for (const [key, item] of this.cache.entries()) {
      if (tags.some(tag => item.tags.includes(tag))) {
        this.cache.delete(key);
      }
    }
  }
}

let defaultAdapter: CacheAdapter | null = null;

export const getCacheAdapter = (customAdapter?: CacheAdapter): CacheAdapter => {
  if (customAdapter) return customAdapter;
  if (!defaultAdapter) {
    defaultAdapter = new InMemoryCacheAdapter();
  }
  return defaultAdapter;
};

/**
 * Generates a consistent cache key for a given path and options.
 */
export const generateCacheKey = (path: string, options?: RequestInit): string => {
  const method = options?.method || 'GET';
  return `${method}:${path}`;
};
