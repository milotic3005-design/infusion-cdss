export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public source: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface FetchOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

const DEFAULT_OPTIONS: Required<FetchOptions> = {
  timeout: 8000,
  retries: 2,
  retryDelay: 1000,
};

export async function apiFetch<T>(
  url: string,
  options?: FetchOptions
): Promise<T> {
  const { timeout, retries, retryDelay } = { ...DEFAULT_OPTIONS, ...options };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status >= 400 && response.status < 500) {
          // Client errors — don't retry
          throw new ApiError(response.status, `Client error: ${response.statusText}`, url);
        }
        throw new ApiError(response.status, `Server error: ${response.statusText}`, url);
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry client errors or abort
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        throw error;
      }

      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * Math.pow(2, attempt))
        );
      }
    }
  }

  throw lastError || new Error('Request failed');
}
