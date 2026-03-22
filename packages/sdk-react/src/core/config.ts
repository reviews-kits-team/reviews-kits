import { ReviewsKitConfigError } from './errors';

export interface ReviewsKitConfig {
  host: string;
  pk: string;
}

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
