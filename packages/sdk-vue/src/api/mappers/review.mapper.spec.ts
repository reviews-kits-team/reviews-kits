import { describe, it, expect } from 'vitest';
import { mapReview } from './review.mapper';
import { RawReview } from '../../types';

describe('Review Mapper', () => {
  it('should transform a raw API review into a clean SDK review model', () => {
    const raw: RawReview = {
      id: '1',
      content: 'Excellent service!',
      rating: 5,
      author_name: 'John Doe',
      author_email: 'john@example.com',
      author_title: 'CEO',
      author_url: 'https://example.com',
      metadata: { source: 'google' }
    };

    const result = mapReview(raw);

    expect(result).toEqual({
      id: '1',
      content: 'Excellent service!',
      rating: 5,
      author: {
        name: 'John Doe',
        email: 'john@example.com',
        title: 'CEO',
        url: 'https://example.com'
      },
      metadata: { source: 'google' }
    });
  });

  it('should handle optional fields correctly', () => {
    const raw: RawReview = {
      id: '2',
      content: 'Good',
      rating: 4,
      author_name: 'Jane Doe'
    };

    const result = mapReview(raw);

    expect(result.author.email).toBeUndefined();
    expect(result.author.title).toBeUndefined();
    expect(result.author.url).toBeUndefined();
    expect(result.metadata).toBeUndefined();
  });
});
