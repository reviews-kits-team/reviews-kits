import { getConfig } from '../core/config';
import { ReviewsKitApiError } from '../core/errors';

export const fetcher = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const { host, pk } = getConfig();

  const url = `${host.replace(/\/$/, '')}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'x-api-key': pk,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred while fetching data.';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // Ignore if response is not JSON
    }
    throw new ReviewsKitApiError(errorMessage, response.status);
  }

  return response.json();
};
