import React, { useEffect } from 'react';
import { canonicalUrl } from '../../marketing/siteUrl';

type JsonLd = Record<string, unknown> | Record<string, unknown>[];

interface SeoHeadProps {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  image?: string;
  jsonLd?: JsonLd;
}

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    document.head.appendChild(el);
  }
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function upsertJsonLd(data: JsonLd | undefined) {
  const id = 'agendai-jsonld';
  const existing = document.getElementById(id);
  if (!data) {
    existing?.remove();
    return;
  }
  const script = existing instanceof HTMLScriptElement ? existing : document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  if (!existing) document.head.appendChild(script);
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  path,
  noindex = false,
  image = '/icons/pwa-512x512.png',
  jsonLd,
}) => {
  useEffect(() => {
    const previousTitle = document.title;
    const url = canonicalUrl(path);
    const absoluteImage = image.startsWith('http') ? image : canonicalUrl(image);

    document.title = title;
    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    });
    upsertLink('canonical', url);

    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: 'pt_BR' });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: absoluteImage });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: absoluteImage });

    upsertJsonLd(jsonLd);

    return () => {
      document.title = previousTitle;
    };
  }, [title, description, path, noindex, image, JSON.stringify(jsonLd ?? null)]);

  return null;
};
