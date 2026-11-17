import { useEffect, useRef } from 'react';
import { sendSalonTrafficBeacon, type SalonTrafficTab } from '../infra/trafficBeaconApi';

interface UseSalonTrafficTabBeaconOptions {
  /** Padrão de rota da página pública (ex.: `/queue/<id>`), nunca a URL crua. */
  pathname: string;
  /** Aba visível da página pública, já resolvida (inclusive pelo `?tab=`). */
  tab: SalonTrafficTab;
}

/**
 * Reporta a página pública do salão ao beacon anônimo, sem duplicar visitas:
 *
 * - `kind:'visit'`: exatamente UMA vez por carregamento da página (primeiro
 *   efeito), sempre com a aba inicial resolvida — inclusive deep link
 *   `?tab=…`. O `TrafficBeaconListener` não emite para `/queue/:id`
 *   (rota auto-reportada), então uma entrada gera 1 ping `visit`.
 * - `kind:'tab'`: somente quando o usuário troca de aba depois disso, nunca
 *   para a aba inicial.
 *
 * As refs evitam o duplo disparo do StrictMode e repetições; o efeito só
 * depende de `pathname` e `tab`, então uma mudança só de query não reenvia.
 * Nenhum identificador de visitante é criado ou enviado.
 */
export function useSalonTrafficTabBeacon({
  pathname,
  tab,
}: UseSalonTrafficTabBeaconOptions): void {
  const sentVisitForRef = useRef<string | null>(null);
  const lastReportedRef = useRef<SalonTrafficTab | null>(null);

  useEffect(() => {
    if (sentVisitForRef.current !== pathname) {
      sentVisitForRef.current = pathname;
      lastReportedRef.current = tab;
      sendSalonTrafficBeacon({ pathname, tab, kind: 'visit' });
      return;
    }
    if (lastReportedRef.current === tab) return;
    lastReportedRef.current = tab;
    sendSalonTrafficBeacon({ pathname, tab, kind: 'tab' });
  }, [pathname, tab]);
}
