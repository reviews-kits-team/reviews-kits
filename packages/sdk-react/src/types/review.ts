export interface ReviewAuthor {
  name: string;
  email?: string;
  title?: string;
  url?: string;
}

export interface Review {
  id: string;
  content: string;
  rating: number;
  author: ReviewAuthor;
  metadata?: Record<string, any>;
}
