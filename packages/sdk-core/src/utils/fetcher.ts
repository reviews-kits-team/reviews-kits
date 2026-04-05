import { getConfig } from '../core/config';
import { ReviewsKitApiError } from '../core/errors';
import { getCacheAdapter, generateCacheKey } from '../core/cache';
import type { ReviewsKitConfig } from '@reviewskits/types';

export const fetcher = async <T>(
  path: string,
  options: RequestInit = {},
  config?: ReviewsKitConfig,
  tags: string[] = []
): Promise<T> => {
  const currentConfig = config || getConfig();
  const { host, pk, cache } = currentConfig;

  // 1. Check Cache (only for GET requests)
  const isGet = !options.method || options.method.toUpperCase() === 'GET';
  
  // Cache is enabled by default (true) unless explicitly set to false
  const cacheEnabled = cache !== false;
  const cacheSettings = typeof cache === 'object' ? cache : {};
  
  const cacheAdapter = cacheEnabled ? getCacheAdapter(cacheSettings.adapter) : null;
  const cacheKey = cacheEnabled ? generateCacheKey(path, options) : null;

  if (isGet && cacheAdapter && cacheKey) {
    const cachedData = await cacheAdapter.get<T>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  const url = `${host.replace(/\/$/, '')}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'x-api-key': pk,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred while fetching data.';
    let errorDetails = null;
    try {
      const errorData = (await response.json()) as Record<string, any>;
      errorMessage = errorData.error?.message || errorData.message || errorMessage;
      errorDetails = errorData.error || errorData;
    } catch (e) {
      // Ignore if response is not JSON
    }
    throw new ReviewsKitApiError(errorMessage, response.status, errorDetails);
  }

  const data = (await response.json()) as T;

  // 2. Store in Cache
  if (isGet && cacheAdapter && cacheKey) {
    await cacheAdapter.set(cacheKey, data, cacheSettings.ttl || 300, tags);
  }

  return data;
};
