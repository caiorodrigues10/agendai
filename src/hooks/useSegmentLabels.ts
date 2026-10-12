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
  /** Segmento resolvido (BARBERSHOP quando o salão ainda não escolheu). */
  segment: BusinessSegment;
  /** Valor bruto do salão, sem fallback — null quando desconhecido. */
  rawSegment: BusinessSegment | null;
  labels: Record<SegmentLabelKey, string>;
  config: SegmentConfig;
  targetAudience: TargetAudience | null;
}

/**
 * Vocabulário do segmento do salão logado (ou do público, que lê o mesmo
 * contexto). Fora do provider cai no default de barbearia — o app inteiro é
 * envolvido pelo BarbershopProvider, então o fallback é só para testes/isolado.
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
      // Sem salão ainda (contexto vazio/settings carregando) o vocabulário é o
      // de barbearia — o mesmo default do banco. OTHER explícito é OTHER.
      const config = getSegmentConfig(rawSegment ?? 'BARBERSHOP');
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
