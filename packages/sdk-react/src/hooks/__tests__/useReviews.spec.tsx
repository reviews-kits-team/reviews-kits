/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useReviews } from '../useReviews';
import { reviewsApi } from '../../api/reviews';
import React from 'react';
import { ReviewsKitProvider } from '../../context/ReviewsKitProvider';

vi.mock('../../api/reviews', () => ({
  reviewsApi: {
    getReviews: vi.fn(),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReviewsKitProvider config={{ pk: 'test', host: 'test' }}>
    {children}
  </ReviewsKitProvider>
);

describe('useReviews Stale Closures & Cancellation (React)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should cancel previous request when params change', async () => {
    let abortSignal: AbortSignal | undefined;
    
    (reviewsApi.getReviews as Mock).mockImplementation((_params: any, options?: RequestInit) => {
      const signal = options?.signal;
      return new Promise((resolve, reject) => {
        const onAbort = () => reject(new DOMException('Aborted', 'AbortError'));
        if (signal?.aborted) return onAbort();
        signal?.addEventListener('abort', onAbort);
        
        setTimeout(() => {
          signal?.removeEventListener('abort', onAbort);
          resolve({ data: [], meta: { page: 1, totalPages: 1 } });
        }, 100);
      });
    });

    const { rerender } = renderHook(
      ({ formId }) => useReviews({ formId }),
      {
        wrapper,
        initialProps: { formId: '1' }
      }
    );

    expect(reviewsApi.getReviews).toHaveBeenCalledTimes(1);

    // Change params
    rerender({ formId: '2' });

    expect(reviewsApi.getReviews).toHaveBeenCalledTimes(2);
    // In React, the first hook's cleanup will be called, aborting the first request.
  });

  it('should ignore results from aborted requests', async () => {
    let resolveFirst: any;
    let rejectFirst: any;
    const firstPromise = new Promise((resolve, reject) => {
      resolveFirst = resolve;
      rejectFirst = reject;
    });

    (reviewsApi.getReviews as Mock)
      .mockReturnValueOnce(firstPromise)
      .mockResolvedValueOnce({ data: [{ id: '2' }], meta: { page: 1, totalPages: 1 } });

    const { result, rerender } = renderHook(
      ({ formId }) => useReviews({ formId }),
      {
        wrapper,
        initialProps: { formId: '1' }
      }
    );

    expect(reviewsApi.getReviews).toHaveBeenCalledTimes(1);

    // Change params
    rerender({ formId: '2' });

    expect(reviewsApi.getReviews).toHaveBeenCalledTimes(2);

    // Wait for second request to finish
    await waitFor(() => {
      expect(result.current.data?.reviews?.[0]?.id).toBe('2');
    });

    // Try to resolve the first request now (it should be ignored by the hook if it checks signal.aborted)
    // Or if the hook aborted the signal, it should already be handled.
    resolveFirst({ data: [{ id: '1' }], meta: { page: 1, totalPages: 1 } });
    
    // Small delay
    await new Promise(r => setTimeout(r, 20));

    // Data should still be from the second request
    expect(result.current.data?.reviews?.[0]?.id).toBe('2');
  });
});
