import { setConfig, InjectionKey } from '../core/config';
import type { ReviewsKitConfig } from '@reviewskits/core';

/**
 * Creates a ReviewsKit plugin instance for Vue 3.
 * Returns an object with an install method compatible with app.use().
 */
export const createReviewsKit = (config: ReviewsKitConfig) => {
  return {
    install(app: any) {
      if (!config.pk) {
        throw new Error('[ReviewsKit] Public key (pk) is required.');
      }
      if (!config.host) {
        throw new Error('[ReviewsKit] Host is required.');
      }

      // Set global config
      setConfig(config);

      // Provide config for components if needed (optional)
      app.provide(InjectionKey, config);
    },
  };
};
