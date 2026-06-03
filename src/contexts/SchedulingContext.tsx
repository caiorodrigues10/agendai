import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Appointment, QueueItem, AIInsight } from '../types';
import { schedulingApi } from '../infra/schedulingApi';
import { useBarbershopFilters } from './BarbershopFiltersContext';
import { useAuth } from './AuthContext';
import { getQueueInsight } from '../services/geminiService';
import { notifyBarberBot } from '../services/notificationService';
import { useBarbershop } from './BarbershopContext';

interface SchedulingContextValue {
  loading: boolean;
  queue: QueueItem[];
  appointments: Appointment[];
  aiInsight: AIInsight | null;
  clientId: string;
  completedCount: number;
  joinQueue: (name: string, whatsapp: string, serviceId: string) => Promise<void>;
  leaveQueue: (id: string) => Promise<void>;
  updateQueueStatus: (id: string, status: QueueItem['status']) => Promise<void>;
  deleteHistoryItem: (id: string) => Promise<void>;
  bookAppointment: (data: any) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  checkInAppointment: (appt: Appointment) => Promise<void>;
}

const SchedulingContext = createContext<SchedulingContextValue | undefined>(undefined);

export const SchedulingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { barbershopId } = useBarbershopFilters();
  const { user } = useAuth();
  const { services, settings } = useBarbershop();
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [clientId, setClientId] = useState('');
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    let cid = localStorage.getItem('barber_customer_id');
    if (!cid) {
      cid = uuidv4();
      localStorage.setItem('barber_customer_id', cid);
    }
    setClientId(cid);
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!barbershopId) {
        setLoading(false);
        return;
      }
      setLoading(true);

      try {
        const queueData = await schedulingApi.listQueue(barbershopId);
        setQueue(queueData as QueueItem[]);
      } catch (error) {
        console.error('Falha ao carregar fila', error);
        setQueue([]);
      }

      try {
        const metrics = await schedulingApi.getQueueMetrics(barbershopId);
        setCompletedCount(metrics.completedCount);
      } catch (error) {
        console.error('Falha ao carregar métricas', error);
      }

      try {
        const appointmentData = await schedulingApi.listAppointments(barbershopId);
        setAppointments(appointmentData as Appointment[]);
      } catch {
        setAppointments([]);
      }
      setLoading(false);
    };
    load();
  }, [barbershopId]);

  useEffect(() => {
    if (!services.length) return;
    const fetchInsight = async () => {
      const insight = await getQueueInsight(queue, services);
      setAiInsight(insight);
    };
    fetchInsight();
    const interval = setInterval(fetchInsight, 30000);
    return () => clearInterval(interval);
  }, [queue, services]);

  const joinQueue = async (name: string, whatsapp: string, serviceId: string) => {
    if (!barbershopId) return;
    const payload = {
      customerName: name,
      whatsapp,
      serviceId,
      barbershopId,
      customerId: clientId
    };

    try {
        const newItem = await schedulingApi.joinQueue(payload);
        setQueue(prev => [...prev, newItem]);
    } catch (error) {
        console.error('Falha ao entrar na fila', error);
        throw error;
    }

    if (!user && settings?.whatsapp) {
      const serviceName = services.find(s => s.id === serviceId)?.name || 'Serviço';
      const msg = `*Novo Cliente na Fila*\n\n💈 *${settings.shopName}*\n👤 Nome: ${name}\n✂️ Serviço: ${serviceName}\n📱 Contato: ${whatsapp}`;
      notifyBarberBot(settings.whatsapp, msg);
    }
  };

  const leaveQueue = async (id: string) => {
    await schedulingApi.deleteQueueItem(id);
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const updateQueueStatus = async (id: string, status: QueueItem['status']) => {
    const target = queue.find(item => item.id === id);
    if (!target) return;
    const payload: any = { status };
    if (status === 'completed') {
      const service = services.find(s => s.id === target.serviceId);
      payload.finalPrice = service?.price || 0;
      payload.completedAt = Date.now();
      payload.completedBy = user?.id || undefined;
    }
    const updated = await schedulingApi.updateQueueItem(id, payload);
    setQueue(prev => prev.map(item => item.id === id ? updated : item));
    
    if (status === 'completed') {
      try {
        const metrics = await schedulingApi.getQueueMetrics(barbershopId);
        setCompletedCount(metrics.completedCount);
      } catch (e) {
        console.error('Erro ao atualizar contagem', e);
      }
    }
  };

  const deleteHistoryItem = async (id: string) => {
    await schedulingApi.deleteQueueItem(id);
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const bookAppointment = async (data: any) => {
    if (!barbershopId) return;
    const payload = { ...data, barbershopId };
    const created = await schedulingApi.bookAppointment(payload);
    setAppointments(prev => [...prev, created]);
  };

  const cancelAppointment = async (id: string) => {
    await schedulingApi.deleteAppointment(id);
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const checkInAppointment = async (appt: Appointment) => {
    await joinQueue(appt.customerName, appt.whatsapp, appt.serviceId);
    await cancelAppointment(appt.id);
  };

  const value = useMemo(() => ({
    loading,
    queue,
    appointments,
    aiInsight,
    clientId,
    completedCount,
    joinQueue,
    leaveQueue,
    updateQueueStatus,
    deleteHistoryItem,
    bookAppointment,
    cancelAppointment,
    checkInAppointment
  }), [loading, queue, appointments, aiInsight, clientId]);

  return <SchedulingContext.Provider value={value}>{children}</SchedulingContext.Provider>;
};

export const useScheduling = () => {
  const ctx = useContext(SchedulingContext);
  if (!ctx) throw new Error('useScheduling must be used within SchedulingProvider');
  return ctx;
};
