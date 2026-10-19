import type { ShopSettings, FeedPost } from '../../types';

/**
 * Dados de exemplo da prévia ao vivo (painel Aparência). O nome do salão e os
 * dados reais (quando o painel os repassa) têm prioridade sobre o fallback.
 */
export const PREVIEW_SETTINGS_FALLBACK: ShopSettings = {
  shopName: 'Seu salão',
  whatsapp: '11999999999',
  schedule: [],
  address: 'Rua das Flores, 123',
  city: 'São Paulo',
  operationMode: 'HYBRID',
  businessSegment: 'BARBERSHOP',
};

export function buildPreviewSettings(
  real: ShopSettings | null | undefined,
  shopName: string
): ShopSettings {
  return { ...PREVIEW_SETTINGS_FALLBACK, ...(real ?? {}), shopName };
}

/** 3 itens de exemplo: placeholders de post (grade 3 colunas) da aba Publicações. */
export const PREVIEW_POSTS: FeedPost[] = [
  {
    id: 'preview-post-1',
    type: 'announcement',
    title: 'Corte + barba',
    content: 'Corte, barba e trincha — o combinado da casa.',
    createdAt: 1770000000000,
    likes: 12,
    status: 'published',
  },
  {
    id: 'preview-post-2',
    type: 'announcement',
    title: 'Agenda de sexta abriu',
    content: 'Agenda de sexta já liberada no app.',
    createdAt: 1770000060000,
    likes: 7,
    status: 'published',
  },
  {
    id: 'preview-post-3',
    type: 'announcement',
    title: 'Barba terça em 20% off',
    content: 'Toda terça, barba completa com 20% de desconto.',
    createdAt: 1770000120000,
    likes: 15,
    status: 'published',
  },
];
