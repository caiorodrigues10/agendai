/**
 * Fonte única da verdade do que cada segmento significa no frontend.
 *
 * Espelho de `backend/src/shared/segments`. São pacotes separados, então a
 * paridade é garantida por teste (`segmentParity.test.ts`), que compara as
 * chaves deste arquivo com o `segmentParity.json` publicado pelo backend.
 *
 * O record de configs vive em `./segmentConfigs` (arquivo só de dado) e os
 * tipos em `./types` — este módulo é a superfície pública.
 */
import { SEGMENT_CONFIGS, SEGMENT_SEARCH_ALIASES } from './segmentConfigs';
import { SEGMENT_GROUP_LABELS } from './types';
import type { BusinessSegment, SegmentConfig, SegmentGroup, TargetAudience } from './types';

export * from './types';
export { SEGMENT_CONFIGS } from './segmentConfigs';

/** Ordem de exibição achatada (grupos + ordem interna), para o radiogroup. */
export const FIRST_CLASS_SEGMENTS: BusinessSegment[] = [
  'BARBERSHOP',
  'HAIR_SALON',
  'NAIL_STUDIO',
  'BEAUTY_STUDIO',
  'LASH_BROW_STUDIO',
  'AESTHETICS',
  'MAKEUP_STUDIO',
  'SPA',
  'PHYSIOTHERAPY',
  'NUTRITION',
  'PSYCHOTHERAPY',
  'PETSHOP',
  'VETERINARY',
  'CAR_WASH',
  'AUTO_REPAIR',
  'PHOTO_STUDIO',
  'TATTOO_PIERCING',
  'COACHING',
  'PRIVATE_CLASSES',
  'TECH_SUPPORT',
  'HOME_SERVICES',
  'OTHER',
];

export const ALL_SEGMENTS: BusinessSegment[] = [
  'BARBERSHOP',
  'HAIR_SALON',
  'NAIL_STUDIO',
  'PETSHOP',
  'BEAUTY_STUDIO',
  'LASH_BROW_STUDIO',
  'AESTHETICS',
  'SPA',
  'MAKEUP_STUDIO',
  'PHYSIOTHERAPY',
  'NUTRITION',
  'PSYCHOTHERAPY',
  'VETERINARY',
  'CAR_WASH',
  'AUTO_REPAIR',
  'PHOTO_STUDIO',
  'TATTOO_PIERCING',
  'COACHING',
  'PRIVATE_CLASSES',
  'TECH_SUPPORT',
  'HOME_SERVICES',
  'OTHER',
];

export const SEGMENT_GROUPS: SegmentGroup[] = [
  'beauty',
  'wellness',
  'health',
  'pet',
  'automotive',
  'services',
  'other',
];

/** Segmentos agrupados para o cadastro, na ordem de exibição. */
export const SEGMENTS_BY_GROUP: { group: SegmentGroup; label: string; segments: BusinessSegment[] }[] =
  SEGMENT_GROUPS.map((group) => ({
    group,
    label: SEGMENT_GROUP_LABELS[group],
    segments: ALL_SEGMENTS.filter((s) => SEGMENT_CONFIGS[s].group === group),
  }));

export const AUDIENCE_OPTIONS: { value: TargetAudience; label: string }[] = [
  { value: 'MASCULINO', label: 'Masculino' },
  { value: 'FEMININO', label: 'Feminino' },
  { value: 'UNISSEX', label: 'Unissex' },
];

export function getSegmentConfig(segment: BusinessSegment | null | undefined): SegmentConfig {
  if (segment && SEGMENT_CONFIGS[segment]) return SEGMENT_CONFIGS[segment];
  return SEGMENT_CONFIGS.OTHER;
}

export function audienceAppliesTo(segment: BusinessSegment): boolean {
  return getSegmentConfig(segment).targetAudience.applies;
}

/**
 * Texto que a busca do cadastro indexa: vocabulário do card + aliases comuns
 * ("unha" acha Manicure, "carro" acha Lava jato). Minúsculas, pronto para
 * comparar com o termo digitado.
 */
export function segmentSearchText(segment: BusinessSegment): string {
  const config = getSegmentConfig(segment);
  return [
    config.labels.segmentLabel,
    config.labels.shopNoun,
    config.labels.professional,
    config.cardDescription,
    ...(SEGMENT_SEARCH_ALIASES[segment] ?? []),
  ]
    .join(' ')
    .toLowerCase();
}
