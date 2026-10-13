import { useContext, useMemo } from 'react';
import { BarbershopContext } from '../contexts/BarbershopContext';
import {
  getSegmentConfig,
  type BusinessSegment,
  type SegmentConfig,
  type SegmentLabelKey,
  type TargetAudience,
} from '../shared/segments';

export interface SegmentLabels {
  /** Segmento resolvido (OTHER quando o salão ainda não escolheu). */
  segment: BusinessSegment;
  /** Valor bruto do salão, sem fallback — null quando desconhecido. */
  rawSegment: BusinessSegment | null;
  labels: Record<SegmentLabelKey, string>;
  config: SegmentConfig;
  targetAudience: TargetAudience | null;
}

/**
 * Vocabulário do segmento do salão logado (ou do público, que lê o mesmo
 * contexto). Sem salão/settings o fallback é OTHER — o mesmo default de
 * `BarbershopContext` e `BusinessSegmentSection`, para o app nunca assumir
 * palavras de barbearia num negócio que ainda não escolheu o segmento.
 *
 * `segmentOverride` serve para telas que mostram o vocabulário de um segmento
 * que ainda não é o do salão (ex.: resumo no cadastro).
 */
export function useSegmentLabels(segmentOverride?: BusinessSegment | null): SegmentLabels {
  const ctx = useContext(BarbershopContext);
  const rawSegment = segmentOverride ?? ctx?.settings?.businessSegment ?? null;
  const targetAudience = ctx?.settings?.targetAudience ?? null;

  return useMemo(
    () => {
      const config = getSegmentConfig(rawSegment ?? 'OTHER');
      return {
        segment: config.segment,
        rawSegment,
        labels: config.labels,
        config,
        targetAudience,
      };
    },
    [rawSegment, targetAudience]
  );
}
