import { describe, it, expect } from 'bun:test';
import { mapReview } from './review.mapper';
import { RawReview } from '../../types';

describe('Review Mapper', () => {
  it('should transform a raw API review into a clean SDK review model', () => {
    const raw: RawReview = {
      id: '1',
      content: 'Excellent service!',
      rating: 5,
      authorName: 'John Doe',
      authorEmail: 'john@example.com',
      authorTitle: 'CEO',
      authorUrl: 'https://example.com',
      createdAt: '2024-03-22T10:00:00Z',
      type: 'google',
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
      createdAt: '2024-03-22T10:00:00Z',
      source: 'google',
      metadata: { source: 'google' }
    });
  });

  it('should handle optional fields correctly', () => {
    const raw: RawReview = {
      id: '2',
      content: 'Good',
      rating: 4,
      authorName: 'Jane Doe',
      createdAt: '2024-03-22T11:00:00Z',
      type: 'direct'
    };

    const result = mapReview(raw);

    expect(result.author.email).toBeUndefined();
    expect(result.author.title).toBeUndefined();
    expect(result.author.url).toBeUndefined();
    expect(result.metadata).toBeUndefined();
  });
});
