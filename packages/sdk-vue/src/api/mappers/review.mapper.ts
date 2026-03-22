import { RawReview, Review } from '../../types';

export const mapReview = (raw: RawReview): Review => {
  return {
    id: raw.id,
    content: raw.content,
    rating: raw.rating,
    author: {
      name: raw.authorName,
      email: raw.authorEmail,
      title: raw.authorTitle,
      url: raw.authorUrl,
    },
    createdAt: raw.createdAt,
    source: raw.type,
    metadata: raw.metadata,
  };
};

export const mapReviews = (raw: RawReview[]): Review[] => {
  return raw.map(mapReview);
};
