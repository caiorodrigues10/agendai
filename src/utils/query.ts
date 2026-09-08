export type QueryValue = string | number | boolean | null | undefined;

/** Builds a query string while preserving false and zero values. */
export function buildQuery(params?: Record<string, QueryValue>): string {
  if (!params) return '';

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }

  const serialized = search.toString();
  return serialized ? `?${serialized}` : '';
}
