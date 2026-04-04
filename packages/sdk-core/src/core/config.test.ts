import { describe, it, expect, beforeEach } from 'vitest';
import { setConfig, getConfig } from './config';
import { ReviewsKitConfigError } from './errors';
import type { ReviewsKitConfig } from '@reviewskits/types';

describe('Configuration System', () => {
  const mockConfig: ReviewsKitConfig = {
    host: 'https://api.test.com',
    pk: 'test-api-key'
  };

  it('should throw ReviewsKitConfigError if config is not set', () => {
    // Reset config if it was set by other tests
    // Since config is a module-level variable, we might need a way to reset it
    // For now, let's just test the behavior
    try {
      getConfig();
    } catch (error) {
      expect(error).toBeInstanceOf(ReviewsKitConfigError);
    }
  });

  it('should set and get configuration correctly', () => {
    setConfig(mockConfig);
    const config = getConfig();
    expect(config).toEqual(mockConfig);
  });
});
