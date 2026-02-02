import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  QueueItem, Service, ShopSettings, StaffMember, FeedPost, Appointment, 
  ShopContextType, AIInsight 
} from '../types';
import { api } from '../services/api';
import { getQueueInsight } from '../services/geminiService';
import { notifyBarberBot } from '../services/notificationService';

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<ShopSettings>({} as ShopSettings);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [ownedIds, setOwnedIds] = useState<string[]>([]);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Initial Load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      
      // Load Identity
      let uid = localStorage.getItem('barberUserId');
      if (!uid) {
          uid = uuidv4();
          localStorage.setItem('barberUserId', uid);
      }
      setCurrentUserId(uid);

      const savedOwned = localStorage.getItem('barberOwnedIds');
      if (savedOwned) {
          const parsed = JSON.parse(savedOwned);
          if (!parsed.includes(uid)) parsed.push(uid);
          setOwnedIds(parsed);
      } else {
          setOwnedIds([uid]);
      }

      // Load Data from "API"
      const [q, s, st, tm, f, a] = await Promise.all([
        api.queue.list(),
        api.services.list(),
        api.settings.get(),
        api.staff.list(),
        api.feed.list(),
        api.appointments.list()
      ]);

      setQueue(q);
      setServices(s);
      setSettings(st);
      setStaff(tm);
      setFeed(f);
      setAppointments(a);
      setLoading(false);
    };

    init();
  }, []);

  // Update Owned IDs Persistence
  useEffect(() => {
    if (ownedIds.length > 0) {
        localStorage.setItem('barberOwnedIds', JSON.stringify(ownedIds));
    }
  }, [ownedIds]);

  // AI Insights Loop
  useEffect(() => {
    if (loading) return;
    
    const fetchInsight = async () => {
      const insight = await getQueueInsight(queue, services);
      setAiInsight(insight);
    };
    
    fetchInsight();
    const interval = setInterval(fetchInsight, 30000); // 30s
    return () => clearInterval(interval);
  }, [queue, services, loading]);

  // --- Actions ---

  const login = async (pin: string): Promise<boolean> => {
    const user = staff.find(m => m.pin === pin);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  const joinQueue = async (name: string, whatsapp: string, serviceId: string, isManual = false) => {
    let newItemId;
    
    if (isManual) {
        newItemId = uuidv4();
    } else {
        const isMainIdBusy = queue.some(q => q.id === currentUserId && q.status === 'waiting');
        newItemId = isMainIdBusy ? uuidv4() : currentUserId;
        if (!ownedIds.includes(newItemId)) setOwnedIds(prev => [...prev, newItemId]);
    }

    const newItem: QueueItem = {
      id: newItemId,
      customerName: name,
      whatsapp,
      serviceId,
      joinedAt: Date.now(),
      status: 'waiting',
      addedByStaff: isManual
    };

    const newQueue = [...queue, newItem];
    setQueue(newQueue);
    await api.queue.save(newQueue);

    if (!isManual) {
      const serviceName = services.find(s => s.id === serviceId)?.name || 'Serviço';
      const msg = `*Novo Cliente na Fila*\nNome: ${name}\nServiço: ${serviceName}\nContato: ${whatsapp}`;
      notifyBarberBot(msg);
    }
  };

  const leaveQueue = async (id: string) => {
    const itemLeaving = queue.find(q => q.id === id);
    const newQueue = queue.filter(item => item.id !== id);
    setQueue(newQueue);
    await api.queue.save(newQueue);

    if (itemLeaving && !itemLeaving.addedByStaff) {
      const msg = `*Cliente Saiu da Fila*\nNome: ${itemLeaving.customerName}\nMotivo: Cancelamento pelo usuário`;
      notifyBarberBot(msg);
    }
  };

  const updateQueueStatus = async (id: string, status: QueueItem['status']) => {
    const newQueue = queue.map(item => {
      if (item.id !== id) return item;
      const update: Partial<QueueItem> = { status };
      
      if (status === 'completed') {
          const service = services.find(s => s.id === item.serviceId);
          update.completedAt = Date.now();
          update.completedBy = currentUser?.id;
          update.finalPrice = service?.price || 0;
      }
      return { ...item, ...update };
    });
    setQueue(newQueue);
    await api.queue.save(newQueue);
  };

  const deleteHistoryItem = async (id: string) => {
    const newQueue = queue.filter(item => item.id !== id);
    setQueue(newQueue);
    await api.queue.save(newQueue);
  };

  // CRUD
  const addService = async (data: Omit<Service, 'id'>) => {
    const newServices = [...services, { id: uuidv4(), ...data }];
    setServices(newServices);
    await api.services.save(newServices);
  };

  const editService = async (id: string, data: Omit<Service, 'id'>) => {
    const newServices = services.map(s => s.id === id ? { ...s, ...data } : s);
    setServices(newServices);
    await api.services.save(newServices);
  };

  const deleteService = async (id: string) => {
    const newServices = services.filter(s => s.id !== id);
    setServices(newServices);
    await api.services.save(newServices);
  };

  const saveSettings = async (newSettings: ShopSettings) => {
    setSettings(newSettings);
    await api.settings.save(newSettings);
  };

  const updateTeam = async (newTeam: StaffMember[]) => {
    setStaff(newTeam);
    await api.staff.save(newTeam);
  };

  // Feed
  const addPost = async (post: FeedPost) => {
    const newFeed = [post, ...feed];
    setFeed(newFeed);
    await api.feed.save(newFeed);
  };

  const deletePost = async (id: string) => {
    const newFeed = feed.filter(p => p.id !== id);
    setFeed(newFeed);
    await api.feed.save(newFeed);
  };

  const likePost = async (id: string) => {
    const newFeed = feed.map(post => 
      post.id === id ? { ...post, likes: post.likes + 1 } : post
    );
    setFeed(newFeed);
    await api.feed.save(newFeed);
  };

  // Appointments
  const bookAppointment = async (data: any) => {
    const newAppt: Appointment = {
      id: uuidv4(),
      ...data,
      createdAt: Date.now(),
      status: 'confirmed'
    };
    const newAppts = [...appointments, newAppt];
    setAppointments(newAppts);
    await api.appointments.save(newAppts);

    const staffName = staff.find(s => s.id === data.staffId)?.name || 'Qualquer';
    const msg = `*Novo Agendamento*\nCliente: ${data.customerName}\nData: ${data.date} às ${data.time}\nProfissional: ${staffName}`;
    notifyBarberBot(msg);
  };

  const cancelAppointment = async (id: string) => {
    const newAppts = appointments.filter(a => a.id !== id);
    setAppointments(newAppts);
    await api.appointments.save(newAppts);
  };

  const checkInAppointment = async (appt: Appointment) => {
    await joinQueue(appt.customerName, appt.whatsapp, appt.serviceId, true);
    await cancelAppointment(appt.id);
  };

  // Utils
  const isShopOpen = () => {
    if (!settings.schedule) return false;
    const now = new Date();
    const day = now.getDay();
    const todaySchedule = settings.schedule[day];
    if (!todaySchedule || !todaySchedule.isOpen) return false;

    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = todaySchedule.openTime.split(':').map(Number);
    const [closeH, closeM] = todaySchedule.closeTime.split(':').map(Number);
    
    return currentTime >= (openH * 60 + openM) && currentTime < (closeH * 60 + closeM);
  };

  const getTodayScheduleDisplay = () => {
    if (!settings.schedule) return 'Indisponível';
    const now = new Date();
    const todaySchedule = settings.schedule[now.getDay()];
    if (!todaySchedule) return 'Horário indisponível';
    if (!todaySchedule.isOpen) return 'Fechado hoje';
    return `${todaySchedule.openTime} às ${todaySchedule.closeTime}`;
  };

  return (
    <ShopContext.Provider value={{
      currentUser, queue, services, settings, staff, feed, appointments, ownedIds, aiInsight, loading,
      login, logout, joinQueue, leaveQueue, updateQueueStatus, deleteHistoryItem,
      addService, editService, deleteService, saveSettings, updateTeam,
      addPost, deletePost, likePost,
      bookAppointment, cancelAppointment, checkInAppointment,
      isShopOpen, getTodayScheduleDisplay
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within a ShopProvider');
  return context;
};
