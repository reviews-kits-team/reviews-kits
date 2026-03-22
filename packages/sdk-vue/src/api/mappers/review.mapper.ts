import { RawReview, Review } from '../../types';

export const mapReview = (raw: RawReview): Review => {
  return {
    id: raw.id,
    content: raw.content,
    rating: raw.rating,
    author: {
      name: raw.author_name,
      email: raw.author_email,
      title: raw.author_title,
      url: raw.author_url,
    },
    metadata: raw.metadata,
  };
};

export const mapReviews = (raw: RawReview[]): Review[] => {
  return raw.map(mapReview);
};
