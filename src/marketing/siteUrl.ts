/** Domínio canônico usado em sitemap/robots quando o env não está definido. */
export const DEFAULT_SITE_URL = 'https://agendai-pcts.onrender.com';

export function getPublicSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }
  return DEFAULT_SITE_URL;
}

export function canonicalUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${getPublicSiteUrl()}${normalized === '/' ? '/' : normalized}`;
}
