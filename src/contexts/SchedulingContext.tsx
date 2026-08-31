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
    extras?: { insertAt?: number; paymentMethod?: 'pix' | 'credit_card' | 'debit_card' | 'fiado' }
  ) => Promise<void>;
  deleteHistoryItem: (id: string) => Promise<void>;
  bookAppointment: (data: any) => Promise<void>;
  bookAppointmentPublic: (data: any) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  checkInAppointment: (appt: Appointment) => Promise<void>;
  refreshAppointments: (date?: string) => Promise<void>;
  loadAvailability: (date: string, staffId?: string) => Promise<void>;
}

const SchedulingContext = createContext<SchedulingContextValue | undefined>(undefined);

/** Intervalo de polling da fila e agendamentos (ms). */
const POLLING_INTERVAL_MS = 15_000;

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
  const shouldPoll = pathname.startsWith('/app') || pathname.startsWith('/queue') || pathname.startsWith('/agendamento');

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
        const queueData = await schedulingApi.listQueue(barbershopId, clientId);
        setQueue(queueData as QueueItem[]);
      } catch (error) {
        if (options?.silent) return; // polling: mantém dados anteriores
        logger.error('Falha ao carregar fila', error);
        setQueue([]);
      }
    },
    [barbershopId, clientId]
  );

  const refreshAppointments = useCallback(
    async (date?: string, options?: { silent?: boolean }) => {
      if (!barbershopId) return;
      try {
        const params: { barbershopId: string; date?: string; from?: string; to?: string } = {
          barbershopId,
        };
        if (date) {
          params.date = date;
        } else {
          const today = new Date();
          const from = today.toISOString().split('T')[0];
          const toDate = new Date(today);
          toDate.setDate(toDate.getDate() + 30);
          params.from = from;
          params.to = toDate.toISOString().split('T')[0];
        }
        const data = await schedulingApi.listAppointments(params);
        setAppointments((data ?? []).map(mapAppointmentFromApi));
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

      try {
        const metrics = await schedulingApi.getQueueMetrics(barbershopId);
        setCompletedCount(metrics.completedCount);
      } catch (error) {
        logger.error('Falha ao carregar métricas', error);
      }

      await refreshAppointments();

      const today = new Date().toISOString().split('T')[0];
      await loadAvailability(today);

      setLoading(false);
    };
    load();
  }, [barbershopId, refreshQueue, refreshAppointments, loadAvailability, shouldPoll]);

  // Polling: refetch periódico da fila e agendamentos, pausado com a aba oculta.
  const isPollingFetchInFlight = useRef(false);
  const pollRef = useRef<() => Promise<void>>(() => Promise.resolve());
  useEffect(() => {
    pollRef.current = async () => {
      if (isPollingFetchInFlight.current) return;
      isPollingFetchInFlight.current = true;
      try {
        await Promise.all([
          refreshQueue({ silent: true }),
          refreshAppointments(undefined, { silent: true }),
        ]);
      } finally {
        isPollingFetchInFlight.current = false;
      }
    };
  });

  useEffect(() => {
    if (!barbershopId || !shouldPoll) return;

    const tick = () => {
      if (document.visibilityState !== 'visible') return;
      void pollRef.current();
    };

    const interval = setInterval(tick, POLLING_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void pollRef.current();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [barbershopId, shouldPoll]);

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
    extras?: { insertAt?: number; paymentMethod?: 'pix' | 'credit_card' | 'debit_card' | 'fiado' }
  ) => {
    const target = queue.find(item => item.id === id);
    if (!target) return;
    const payload: QueueUpdatePayload = { status };
    if (status === 'completed') {
      const service = services.find(s => s.id === target.serviceId);
      payload.finalPrice = service?.price || 0;
      payload.completedBy = user?.id || undefined;
      payload.paymentMethod = extras?.paymentMethod;
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

      await schedulingApi.bookAppointmentPublic({
        ...data,
        barbershopId,
        staffId: data.staffId === 'any' ? null : data.staffId,
      });
      await loadAvailability(data.date, data.staffId !== 'any' ? data.staffId : undefined);
    },
    [barbershopId, loadAvailability]
  );

  const cancelAppointment = async (id: string) => {
    await schedulingApi.deleteAppointment(id);
    setAppointments(prev => prev.filter(a => a.id !== id));
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
