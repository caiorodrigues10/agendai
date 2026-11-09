import type { BusinessSegment, SegmentFeature } from './types';

/**
 * Features por segmento — fonte única da verdade (o backend espelha em
 * `backend/src/shared/segments`; a paridade é checada no `segmentParity.test.ts`).
 *
 * Fica num módulo próprio porque o `config/tabRegistry.ts` (caminho crítico do
 * app) só precisa deste mapa: importar o barrel de `shared/segments` arrastava
 * o catálogo inteiro de segmentos (~15 kB) para o chunk principal.
 */
export const SEGMENT_FEATURES: Partial<Record<BusinessSegment, SegmentFeature[]>> = {
  LAW_FIRM: ['caseManagement'],
};

/**
 * O segmento tem a feature? (ex.: `caseManagement` — gestão de processos).
 */
export function hasSegmentFeature(
  segment: BusinessSegment | null | undefined,
  feature: SegmentFeature
): boolean {
  if (!segment) return false;
  return SEGMENT_FEATURES[segment]?.includes(feature) === true;
}
