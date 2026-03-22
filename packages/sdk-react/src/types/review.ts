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
  createdAt: string;
  source: string;
  metadata?: Record<string, any>;
}
