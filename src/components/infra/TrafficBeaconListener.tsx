import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { sendTrafficBeacon } from '../../infra/trafficBeaconApi';

/**
 * Listener for the privacy-safe traffic beacon.
 *
 * It is mounted globally alongside the other application listeners. The ref
 * prevents React StrictMode's development double-effect from sending the same
 * pathname twice.
 */
export const TrafficBeaconListener: React.FC = () => {
  const location = useLocation();
  const lastPathname = useRef<string | null>(null);

  useEffect(() => {
    const pathname = location.pathname;
    if (lastPathname.current === pathname) return;

    lastPathname.current = pathname;
    // `/queue/:id` é auto-reportada pela própria página
    // (`useSalonTrafficTabBeacon`), que conhece a aba inicial resolvida — o
    // listener não emite para essa rota, senão a entrada geraria 2 pings.
    if (isSelfReportedSalonPage(pathname)) return;
    // `search` entra apenas para o `tab` allowlistado das páginas de salão
    // atendidas pelo listener (`/s/salon/:id?tab=…`); a query inteira nunca é
    // serializada e a deduplicação continua por pathname (StrictMode não duplica).
    sendTrafficBeacon({ pathname, search: location.search });
  }, [location.pathname, location.search]);

  return null;
};

/**
 * Rota da página pública do salão cuja visita é reportada pela página em si
 * (exatamente 1 ping `kind:'visit'` por carregamento). As demais páginas de
 * salão (produto, `/s/…`) continuam saindo pelo listener.
 */
export function isSelfReportedSalonPage(pathname: string): boolean {
  return /^\/queue\/[^/]+$/.test(pathname);
}
