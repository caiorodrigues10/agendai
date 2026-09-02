let lastCorrelationId: string | null = null;

/**
 * Stores the last correlation ID received from an API response.
 * Called by the API client after each request.
 */
export function setLastCorrelationId(id: string): void {
  lastCorrelationId = id;
}

/**
 * Returns the last correlation ID received from an API response, or null.
 */
export function getLastCorrelationId(): string | null {
  return lastCorrelationId;
}
