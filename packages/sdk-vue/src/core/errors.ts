export class ReviewsKitError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'ReviewsKitError';
  }
}

export class ReviewsKitConfigError extends ReviewsKitError {
  constructor() {
    super('ReviewsKit SDK not initialized properly.', 'CONFIG_MISSING');
  }
}

export class ReviewsKitApiError extends ReviewsKitError {
  constructor(
    message: string, 
    public status: number, 
    public details?: any
  ) {
    super(`[API Error ${status}] ${message}`, 'API_ERROR');
    this.name = 'ReviewsKitApiError';
  }
}
