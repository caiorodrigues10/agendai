import { canonicalUrl } from './siteUrl';

export function softwareApplicationLd(path = '/') {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AgendAI',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: canonicalUrl(path),
    description:
      'Fila digital, agenda, CRM e financeiro para salões de beleza, barbearias e studios.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL',
      description: '30 dias de teste do Pro sem cartão. Depois Essencial a R$ 14/mês ou Pro a R$ 20/mês.',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AgendAI',
      url: canonicalUrl('/'),
    },
  };
}

export function faqPageLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}
