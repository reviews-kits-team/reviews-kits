import React, { createContext, useContext, useEffect, type ReactNode } from 'react';
import { setConfig, type ReviewsKitConfig } from '../core/config';

const ReviewsKitContext = createContext<ReviewsKitConfig | null>(null);

export interface ReviewsKitProviderProps {
  config: ReviewsKitConfig;
  children: ReactNode;
}

export const ReviewsKitProvider: React.FC<ReviewsKitProviderProps> = ({ config, children }) => {
  // Set config immediately so it's available for children during their first render
  setConfig(config);

  useEffect(() => {
    setConfig(config);
  }, [config]);

  return (
    <ReviewsKitContext.Provider value={config}>
      {children}
    </ReviewsKitContext.Provider>
  );
};

export const useReviewsKitConfig = () => {
  const context = useContext(ReviewsKitContext);
  return context;
};
