/** Unwrap `{ success, data }` envelopes used by the AgendAI API. */
export function unwrapData<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

/**
 * Normalize list payloads. Several modules return `{ items, total, page, limit }`
 * while wrappers historically assumed a bare array — calling `.map` on the object
 * crashes the staff dashboard ErrorBoundary.
 */
export function unwrapList<T>(res: unknown): T[] {
  const data = unwrapData<unknown>(res);
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.items)) return record.items as T[];
    if (Array.isArray(record.entries)) return record.entries as T[];
    if (Array.isArray(record.results)) return record.results as T[];
  }
  return [];
}
