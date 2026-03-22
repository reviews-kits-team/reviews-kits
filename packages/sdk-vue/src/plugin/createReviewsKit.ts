import { App } from 'vue';
import { setConfig, InjectionKey, ReviewsKitConfig } from '../core/config';

export const createReviewsKit = (config: ReviewsKitConfig) => {
  return {
    install(app: App) {
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
