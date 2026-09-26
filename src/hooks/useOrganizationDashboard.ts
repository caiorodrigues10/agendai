import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { authStorage } from '../infra/authStorage';
import { OrganizationDashboardShop, organizationsApi } from '../infra/organizationsApi';
import { realtimeWsUrl } from '../infra/realtimeWs';
import { logger } from '../utils/logger';

const POLL_INTERVAL_MS = 30000;
const WS_REFRESH_DEBOUNCE_MS = 1000;
const WS_RECONNECT_MAX_MS = 30000;

/**
 * Dashboard multiunidades de uma organização.
 *
 * - Carrega `GET /organizations/:id/dashboard` (poll de 30s — cobre também
 *   `isOpen`/receita, que não emitem evento WS).
 * - Abre 1 conexão WS por salão (`realtimeWsUrl`): `queue:changed` e
 *   `appointments:changed` disparam refetch com debounce comum de 1s (vários
 *   salões podem disparar juntos → uma única chamada).
 * - Reconexão com backoff exponencial (máx 30s) e refetch ao voltar a aba.
 * - `liveNow`/`revenue` vêm do backend já decididos (inclusive o corte do fim
 *   previsto do agendamento) — aqui só mantemos a cópia em dia.
 */
export function useOrganizationDashboard(orgId: string | null | undefined) {
  const [shops, setShops] = useState<OrganizationDashboardShop[]>([]);
  const [loading, setLoading] = useState(!!orgId);
  const [error, setError] = useState<string | null>(null);
  const [connectedSockets, setConnectedSockets] = useState(0);

  const inFlightRef = useRef(false);
  const requestOrgRef = useRef<string | null>(null);
  const debounceRef = useRef<number | null>(null);
  const fetchRef = useRef<(opts?: { silent?: boolean }) => Promise<void>>(() => Promise.resolve());

  const refetch = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!orgId) {
        requestOrgRef.current = null;
        setShops([]);
        setError(null);
        setLoading(false);
        return;
      }
      // registra a org alvo antes do guard: se mudou durante uma corrida em
      // voo, a resposta antiga é descartada e o final re-executa
      requestOrgRef.current = orgId;
      if (inFlightRef.current) return;
      if (!opts?.silent) setLoading(true);
      inFlightRef.current = true;
      let stale = false;
      try {
        const data = await organizationsApi.getDashboard(orgId);
        if (requestOrgRef.current === orgId) {
          setShops(data);
          setError(null);
        } else {
          stale = true;
        }
      } catch (err) {
        if (requestOrgRef.current === orgId) {
          logger.error('Falha ao carregar dashboard da organização', err);
          if (!opts?.silent) setError(err instanceof Error ? err.message : String(err));
        } else {
          stale = true;
        }
      }
      inFlightRef.current = false;
      if (stale) {
        void fetchRef.current();
        return;
      }
      if (!opts?.silent) setLoading(false);
    },
    [orgId]
  );

  // sempre atual: efeitos de WS/poll leem a versão corrente (mesmo padrão do
  // SchedulingContext com pollRef)
  useEffect(() => {
    fetchRef.current = refetch;
  });

  // carga inicial / troca de organização
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch de dados inicial (mesmo padrão de useOnboardingStatus)
    void refetch();
  }, [refetch]);

  const shopIds = useMemo(() => shops.map(s => s.barbershopId).join(','), [shops]);

  // 1 WS por salão; eventos das salas disparam refetch único com debounce
  useEffect(() => {
    const ids = shopIds ? shopIds.split(',').filter(Boolean) : [];
    if (!ids.length || !orgId || !authStorage.getAccessToken()) return;

    let stopped = false;
    const sockets = new Map<string, WebSocket>();
    const timers = new Map<string, number>();
    const attempts = new Map<string, number>();
    const connected = new Set<string>();

    const updateConnected = () => setConnectedSockets(connected.size);

    const scheduleRefresh = () => {
      if (debounceRef.current) return;
      debounceRef.current = window.setTimeout(() => {
        debounceRef.current = null;
        void fetchRef.current({ silent: true });
      }, WS_REFRESH_DEBOUNCE_MS);
    };

    const closeShop = (shopId: string) => {
      const timer = timers.get(shopId);
      if (timer) window.clearTimeout(timer);
      timers.delete(shopId);
      const ws = sockets.get(shopId);
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onclose = null;
        ws.onerror = null;
        ws.close();
        sockets.delete(shopId);
      }
      if (connected.delete(shopId)) updateConnected();
    };

    const connect = (shopId: string) => {
      if (stopped || document.visibilityState !== 'visible') return;
      closeShop(shopId);
      const ws = new WebSocket(realtimeWsUrl(shopId));
      sockets.set(shopId, ws);
      ws.onopen = () => {
        attempts.set(shopId, 0);
        connected.add(shopId);
        updateConnected();
        void fetchRef.current({ silent: true });
      };
      ws.onmessage = event => {
        if (typeof event.data !== 'string' || event.data === 'pong') return;
        try {
          const msg = JSON.parse(event.data) as { type?: string };
          if (msg.type === 'queue:changed' || msg.type === 'appointments:changed') scheduleRefresh();
        } catch {
          /* ignore */
        }
      };
      ws.onclose = () => {
        if (connected.delete(shopId)) updateConnected();
        if (stopped || document.visibilityState !== 'visible') return;
        const delay = Math.min(1000 * 2 ** (attempts.get(shopId) ?? 0), WS_RECONNECT_MAX_MS);
        attempts.set(shopId, (attempts.get(shopId) ?? 0) + 1);
        timers.set(shopId, window.setTimeout(() => connect(shopId), delay));
      };
      ws.onerror = () => ws.close();
    };

    ids.forEach(connect);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        stopped = false;
        ids.forEach(id => {
          if (!sockets.has(id)) connect(id);
        });
        void fetchRef.current({ silent: true });
      } else {
        stopped = true;
        ids.forEach(closeShop);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stopped = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      ids.forEach(closeShop);
      setConnectedSockets(0);
    };
  }, [shopIds, orgId]);

  // poll de 30s sempre que visível: atualiza o que não emite evento WS
  // (isOpen muda com o tempo; receita muda em conclusões já cobertas pela fila)
  useEffect(() => {
    if (!orgId) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      void fetchRef.current({ silent: true });
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [orgId]);

  return { shops, loading, error, refetch, connectedSockets };
}
