import { ReviewsKitConfigError } from './errors';
export type { ReviewsKitConfig } from '@reviewskits/types';
import type { ReviewsKitConfig } from '@reviewskits/types';

let config: ReviewsKitConfig | null = null;

export const setConfig = (newConfig: ReviewsKitConfig) => {
  config = newConfig;
};

export const getConfig = (): ReviewsKitConfig => {
  if (!config) {
    throw new ReviewsKitConfigError();
  }
  return config;
};
