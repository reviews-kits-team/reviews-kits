import { getConfig, type ReviewsKitConfig } from '../core/config';
import { ReviewsKitApiError } from '../core/errors';

export const fetcher = async <T>(
  path: string,
  options: RequestInit = {},
  config?: ReviewsKitConfig
): Promise<T> => {
  const { host, pk } = config || getConfig();

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
    let errorDetails = null;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error?.message || errorData.message || errorMessage;
      errorDetails = errorData.error || errorData;
    } catch (e) {
      // Ignore if response is not JSON
    }
    throw new ReviewsKitApiError(errorMessage, response.status, errorDetails);
  }

  return response.json();
};
