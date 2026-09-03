import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Appointment, QueueItem, AIInsight } from '../types';
import { schedulingApi, QueueUpdatePayload } from '../infra/schedulingApi';
import { authStorage } from '../infra/authStorage';
import { realtimeWsUrl } from '../infra/realtimeWs';
import { useBarbershopFilters } from './BarbershopFiltersContext';
import { useAuth } from './AuthContext';
import { getQueueInsight } from '../services/geminiService';
import { useBarbershop } from './BarbershopContext';
import { AvailabilitySlot, mapAppointmentFromApi } from '../utils/schedulingUtils';
import { logger } from '../utils/logger';

interface SchedulingContextValue {
  loading: boolean;
  queue: QueueItem[];
  appointments: Appointment[];
  availability: AvailabilitySlot[];
  aiInsight: AIInsight | null;
  clientId: string;
  completedCount: number;
  joinQueue: (
    name: string,
    whatsapp: string,
    serviceId: string,
    opts?: { additionalPerson?: boolean; responsibleSessionId?: string }
  ) => Promise<void>;
  leaveQueue: (id: string) => Promise<void>;
  updateQueueStatus: (
    id: string,
    status: QueueItem['status'],
    extras?: { insertAt?: number; paymentMethod?: 'pix' | 'credit_card' | 'debit_card' | 'fiado'; commissionSplits?: { professionalId: string; percentage: number }[]; retailSale?: import('../infra/productsApi').RetailSalePayload }
  ) => Promise<void>;
  deleteHistoryItem: (id: string) => Promise<void>;
  bookAppointment: (data: any) => Promise<void>;
  bookAppointmentPublic: (data: any) => Promise<unknown>;
  cancelAppointment: (id: string) => Promise<void>;
  markAppointmentNoShow: (id: string) => Promise<void>;
  checkInAppointment: (appt: Appointment) => Promise<void>;
  refreshAppointments: (date?: string) => Promise<void>;
  loadAvailability: (date: string, staffId?: string) => Promise<void>;
}

const SchedulingContext = createContext<SchedulingContextValue | undefined>(undefined);

/** Fallback de polling quando o WebSocket está desconectado (ms). */
const POLLING_INTERVAL_MS = 60_000;
const WS_RECONNECT_MAX_MS = 30_000;

function sameSnapshot(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

export const SchedulingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const { barbershopId } = useBarbershopFilters();
  const { user } = useAuth();
  const { services, settings } = useBarbershop();
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [clientId, setClientId] = useState(() => {
    let cid = localStorage.getItem('barber_customer_id');
    if (!cid) {
      cid = uuidv4();
      localStorage.setItem('barber_customer_id', cid);
    }
    return cid;
  });
  const [completedCount, setCompletedCount] = useState(0);
  const shouldPoll = pathname.startsWith('/app') || pathname.startsWith('/queue');
  const lastAppointmentQueryRef = useRef<{ date?: string; from?: string; to?: string } | null>(null);
  const wsConnectedRef = useRef(false);

  const loadAvailability = useCallback(
    async (date: string, staffId?: string) => {
      if (!barbershopId) return;
      try {
        const slots = await schedulingApi.getAvailability(barbershopId, date, staffId);
        setAvailability(Array.isArray(slots) ? slots : []);
      } catch {
        setAvailability([]);
      }
    },
    [barbershopId]
  );

  const refreshQueue = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!barbershopId) return;
      try {
        const queueData = (await schedulingApi.listQueue(barbershopId, clientId)) as QueueItem[];
        setQueue(prev => (sameSnapshot(prev, queueData) ? prev : queueData));
      } catch (error) {
        if (options?.silent) return; // polling: mantém dados anteriores
        logger.error('Falha ao carregar fila', error);
        setQueue([]);
      }
    },
    [barbershopId, clientId]
  );

  const refreshAppointments = useCallback(
    async (date?: string, options?: { silent?: boolean; reuseLast?: boolean }) => {
      if (!barbershopId) return;
      if (!authStorage.getAccessToken()) return;
      try {
        let params: { barbershopId: string; date?: string; from?: string; to?: string } = {
          barbershopId,
        };
        if (options?.reuseLast && lastAppointmentQueryRef.current) {
          params = { barbershopId, ...lastAppointmentQueryRef.current };
        } else if (date) {
          params.date = date;
          lastAppointmentQueryRef.current = { date };
        } else {
          const today = new Date();
          const from = today.toISOString().split('T')[0];
          const toDate = new Date(today);
          toDate.setDate(toDate.getDate() + 30);
          const to = toDate.toISOString().split('T')[0];
          params.from = from;
          params.to = to;
          lastAppointmentQueryRef.current = { from, to };
        }
        const data = await schedulingApi.listAppointments(params);
        const mapped = (data ?? []).map(mapAppointmentFromApi);
        setAppointments(prev => (sameSnapshot(prev, mapped) ? prev : mapped));
      } catch {
        if (options?.silent) return; // polling: mantém dados anteriores
        setAppointments([]);
      }
    },
    [barbershopId]
  );

  useEffect(() => {
    if (!shouldPoll) {
      return;
    }

    const load = async () => {
      if (!barbershopId) {
        setLoading(false);
        return;
      }
      setLoading(true);

      await refreshQueue();

      if (authStorage.getAccessToken()) {
        try {
          const metrics = await schedulingApi.getQueueMetrics(barbershopId);
          setCompletedCount(metrics.completedCount);
        } catch (error) {
          logger.error('Falha ao carregar métricas', error);
        }
        await refreshAppointments();
      }

      const today = new Date().toISOString().split('T')[0];
      await loadAvailability(today);

      setLoading(false);
    };
    load();
  }, [barbershopId, refreshQueue, refreshAppointments, loadAvailability, shouldPoll]);

  // Refetch sob demanda (WS e fallback de polling).
  const isPollingFetchInFlight = useRef(false);
  const pollRef = useRef<() => Promise<void>>(() => Promise.resolve());
  useEffect(() => {
    pollRef.current = async () => {
      if (isPollingFetchInFlight.current) return;
      isPollingFetchInFlight.current = true;
      try {
        await Promise.all([
          refreshQueue({ silent: true }),
          refreshAppointments(undefined, { silent: true, reuseLast: true }),
        ]);
      } finally {
        isPollingFetchInFlight.current = false;
      }
    };
  });

  const queueDebounceRef = useRef<number | null>(null);
  const apptDebounceRef = useRef<number | null>(null);
  const scheduleQueueRefresh = useCallback(() => {
    if (queueDebounceRef.current) return;
    queueDebounceRef.current = window.setTimeout(() => {
      queueDebounceRef.current = null;
      void refreshQueue({ silent: true });
    }, 150);
  }, [refreshQueue]);
  const scheduleAppointmentsRefresh = useCallback(() => {
    if (apptDebounceRef.current) return;
    apptDebounceRef.current = window.setTimeout(() => {
      apptDebounceRef.current = null;
      void refreshAppointments(undefined, { silent: true, reuseLast: true });
    }, 150);
  }, [refreshAppointments]);

  useEffect(() => {
    if (!barbershopId || !shouldPoll) return;

    let stopped = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let attempt = 0;

    const disconnect = () => {
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onclose = null;
        socket.onerror = null;
        socket.close();
        socket = null;
      }
      wsConnectedRef.current = false;
    };

    const connect = () => {
      if (stopped || document.visibilityState !== 'visible') return;
      disconnect();
      const next = new WebSocket(realtimeWsUrl(barbershopId));
      socket = next;
      next.onopen = () => {
        attempt = 0;
        wsConnectedRef.current = true;
        void pollRef.current();
      };
      next.onmessage = event => {
        if (typeof event.data !== 'string') return;
        if (event.data === 'pong') return;
        try {
          const msg = JSON.parse(event.data) as { type?: string };
          if (msg.type === 'queue:changed') scheduleQueueRefresh();
          if (msg.type === 'appointments:changed') scheduleAppointmentsRefresh();
        } catch {
          /* ignore */
        }
      };
      next.onclose = () => {
        wsConnectedRef.current = false;
        if (stopped || document.visibilityState !== 'visible') return;
        const delay = Math.min(1000 * 2 ** attempt, WS_RECONNECT_MAX_MS);
        attempt += 1;
        reconnectTimer = window.setTimeout(connect, delay);
      };
      next.onerror = () => {
        next.close();
      };
    };

    connect();

    const interval = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      if (wsConnectedRef.current) return;
      void pollRef.current();
    }, POLLING_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        stopped = false;
        if (!wsConnectedRef.current) connect();
        void pollRef.current();
      } else {
        stopped = true;
        disconnect();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopped = true;
      window.clearInterval(interval);
      if (queueDebounceRef.current) window.clearTimeout(queueDebounceRef.current);
      if (apptDebounceRef.current) window.clearTimeout(apptDebounceRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      disconnect();
    };
  }, [barbershopId, shouldPoll, scheduleQueueRefresh, scheduleAppointmentsRefresh]);

  useEffect(() => {
    if (!services.length || !shouldPoll) return;
    const fetchInsight = async () => {
      const insight = await getQueueInsight(queue, services);
      setAiInsight(insight);
    };
    fetchInsight();
    const interval = setInterval(fetchInsight, 30000);
    return () => clearInterval(interval);
  }, [queue, services, shouldPoll]);

  const joinQueue = async (
    name: string,
    whatsapp: string,
    serviceId: string,
    opts?: { additionalPerson?: boolean; responsibleSessionId?: string }
  ) => {
    if (!barbershopId) return;
    const payload = {
      customerName: name,
      whatsapp,
      serviceId,
      barbershopId,
      ...(opts?.additionalPerson
        ? { responsibleSessionId: opts.responsibleSessionId ?? clientId }
        : { sessionId: clientId }),
    };

    try {
      const newItem = await schedulingApi.joinQueue(payload);
      setQueue(prev => [...prev, newItem]);
    } catch (error) {
      logger.error('Falha ao entrar na fila', error);
      throw error;
    }
  };

  const leaveQueue = async (id: string) => {
    await schedulingApi.deleteQueueItem(id);
    setQueue(prev => prev.filter(item => item.id !== id));
    try {
      const metrics = await schedulingApi.getQueueMetrics(barbershopId);
      setCompletedCount(metrics.completedCount);
    } catch (e) {
      logger.error('Erro ao atualizar métricas após remoção', e);
    }
  };

  const updateQueueStatus = async (
    id: string,
    status: QueueItem['status'],
    extras?: {
      insertAt?: number;
      paymentMethod?: 'pix' | 'credit_card' | 'debit_card' | 'fiado';
      commissionSplits?: { professionalId: string; percentage: number }[];
      retailSale?: import('../infra/productsApi').RetailSalePayload;
    }
  ) => {
    const target = queue.find(item => item.id === id);
    if (!target) return;
    const payload: QueueUpdatePayload = { status };
    if (status === 'completed') {
      const service = services.find(s => s.id === target.serviceId);
      payload.finalPrice = service?.price || 0;
      payload.completedBy = user?.id || undefined;
      payload.paymentMethod = extras?.paymentMethod;
      payload.commissionSplits = extras?.commissionSplits;
      payload.retailSale = extras?.retailSale;
    }
    if (status === 'waiting' && extras?.insertAt != null) {
      payload.insertAt = extras.insertAt;
    }
    const updated = await schedulingApi.updateQueueItem(id, payload);
    setQueue(prev =>
      [...prev.map(item => (item.id === id ? updated : item))].sort(
        (a, b) => a.joinedAt - b.joinedAt
      )
    );

    if (status === 'completed') {
      try {
        const metrics = await schedulingApi.getQueueMetrics(barbershopId);
        setCompletedCount(metrics.completedCount);
      } catch (e) {
        logger.error('Erro ao atualizar contagem', e);
      }
    }
  };

  const deleteHistoryItem = async (id: string) => {
    await schedulingApi.deleteQueueItem(id);
    setQueue(prev => prev.filter(item => item.id !== id));
    try {
      const metrics = await schedulingApi.getQueueMetrics(barbershopId);
      setCompletedCount(metrics.completedCount);
    } catch (e) {
      logger.error('Erro ao atualizar métricas após remoção', e);
    }
  };

  const bookAppointment = async (data: any) => {
    if (!barbershopId) return;
    const payload = {
      ...data,
      barbershopId,
      staffId: data.staffId === 'any' ? null : data.staffId,
    };
    const created = await schedulingApi.bookAppointment(payload);
    const mapped = mapAppointmentFromApi(created);
    setAppointments(prev => [...prev, mapped]);
    await loadAvailability(data.date, data.staffId !== 'any' ? data.staffId : undefined);
  };

  // Public booking (no auth) – used on the public barbershop page.
  const bookAppointmentPublic = useCallback(
    async (data: any) => {
      if (!barbershopId) throw new Error('Barbearia não selecionada');

      const created = await schedulingApi.bookAppointmentPublic({
        ...data,
        barbershopId,
        staffId: data.staffId === 'any' ? null : data.staffId,
      });
      await loadAvailability(data.date, data.staffId !== 'any' ? data.staffId : undefined);
      return created;
    },
    [barbershopId, loadAvailability]
  );

  const cancelAppointment = async (id: string) => {
    await schedulingApi.deleteAppointment(id);
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const markAppointmentNoShow = async (id: string) => {
    await schedulingApi.updateAppointment(id, { status: 'NO_SHOW' });
    setAppointments(prev => prev.map(item => item.id === id ? { ...item, status: 'no_show' as const } : item));
  };

  const checkInAppointment = async (appt: Appointment) => {
    await schedulingApi.checkInAppointment(appt.id);
    setAppointments(prev =>
      prev.map(a => (a.id === appt.id ? { ...a, status: 'checked_in' as const } : a))
    );
    await refreshQueue();
  };

  const value = useMemo(
    () => ({
      loading,
      queue,
      appointments,
      availability,
      aiInsight,
      clientId,
      completedCount,
      joinQueue,
      leaveQueue,
      updateQueueStatus,
      deleteHistoryItem,
      bookAppointment,
      cancelAppointment,
      markAppointmentNoShow,
      checkInAppointment,
      refreshAppointments,
      loadAvailability,
      bookAppointmentPublic,
    }),
    [
      loading,
      queue,
      appointments,
      availability,
      aiInsight,
      clientId,
      completedCount,
      refreshAppointments,
      loadAvailability,
      bookAppointmentPublic,
    ]
  );

  return <SchedulingContext.Provider value={value}>{children}</SchedulingContext.Provider>;
};

export const useScheduling = () => {
  const ctx = useContext(SchedulingContext);
  if (!ctx) throw new Error('useScheduling must be used within SchedulingProvider');
  return ctx;
};
