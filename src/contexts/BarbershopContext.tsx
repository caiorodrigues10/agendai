import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { barbershopApi } from '../infra/barbershopApi';
import { StaffMember, Service, ShopSettings, FeedPost } from '../types';
import { mapScheduleFromApi, mapStaffFromApi } from '../utils/schedulingUtils';
import { useBarbershopFilters } from './BarbershopFiltersContext';
import { useAuth } from './AuthContext';
import { logger } from '../utils/logger';

interface BarbershopContextValue {
  loading: boolean;
  services: Service[];
  staff: StaffMember[];
  settings: ShopSettings | null;
  feed: FeedPost[];
  setSettings: (settings: ShopSettings) => Promise<void>;
  addService: (data: Omit<Service, 'id'>) => Promise<void>;
  editService: (id: string, data: Omit<Service, 'id'>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  updateTeam: (team: StaffMember[]) => Promise<void>;
  addPost: (post: FeedPost) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  likePost: (id: string) => Promise<void>;
  isShopOpen: () => boolean;
  getTodayScheduleDisplay: () => string;
}

const BarbershopContext = createContext<BarbershopContextValue | undefined>(undefined);

function isShopStaffRole(role?: string) {
  const normalized = (role || '').toUpperCase();
  return normalized === 'OWNER' || normalized === 'EMPLOYEE';
}

export const BarbershopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { barbershopId, setBarbershopId } = useBarbershopFilters();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [settings, setSettingsState] = useState<ShopSettings | null>(null);
  const [feed, setFeed] = useState<FeedPost[]>([]);

  // Owner/employee always bind to their own tenant — never pick the first public shop.
  useEffect(() => {
    if (authLoading) return;

    if (user?.barbershopId && isShopStaffRole(user.role)) {
      if (barbershopId !== user.barbershopId) {
        setBarbershopId(user.barbershopId);
      }
      return;
    }

    // Anonymous / master: do not auto-select a shop here.
    // PublicHome sets barbershopId from the URL; staff pages require a tenant.
  }, [user, authLoading, barbershopId, setBarbershopId]);

  useEffect(() => {
    const load = async () => {
      if (authLoading) {
        setLoading(true);
        return;
      }

      // Staff user still waiting for tenant sync
      if (!barbershopId && user?.barbershopId && isShopStaffRole(user.role)) {
        setLoading(true);
        return;
      }

      if (!barbershopId) {
        setServices([]);
        setStaff([]);
        setFeed([]);
        setSettingsState(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      // Avoid flashing the previous tenant while switching shops
      setSettingsState(null);
      setServices([]);
      setStaff([]);
      setFeed([]);

      try {
        const servicesData = await barbershopApi.listServices(barbershopId);
        setServices(Array.isArray(servicesData) ? (servicesData as Service[]) : []);
      } catch (e) {
        logger.error('Falha ao carregar serviços', e);
        setServices([]);
      }

      try {
        const staffData = await barbershopApi.listStaff(barbershopId);
        setStaff(Array.isArray(staffData) ? (staffData as Record<string, unknown>[]).map(mapStaffFromApi) : []);
      } catch (e) {
        logger.error('Falha ao carregar equipe', e);
        setStaff([]);
      }

      try {
        const feedData = await barbershopApi.listFeed(barbershopId);
        setFeed(Array.isArray(feedData) ? (feedData as FeedPost[]) : []);
      } catch (e) {
        logger.error('Falha ao carregar feed', e);
        setFeed([]);
      }

      try {
        const shopData = (await barbershopApi.getBarbershop(barbershopId)) as {
          name?: string;
          whatsapp?: string;
          address?: string | null;
          city?: string | null;
          logoUrl?: string | null;
          latitude?: number | null;
          longitude?: number | null;
        } | null;
        let schedule = mapScheduleFromApi(null);
        try {
          const scheduleData = (await barbershopApi.getSchedule(barbershopId)) as
            | { dayOfWeek: number; isOpen: boolean; openTime: string; closeTime: string }[]
            | {
                schedule?: {
                  dayOfWeek: number;
                  isOpen: boolean;
                  openTime: string;
                  closeTime: string;
                }[];
              }
            | null;
          schedule = mapScheduleFromApi(
            Array.isArray(scheduleData) ? scheduleData : scheduleData?.schedule
          );
        } catch (e) {
          logger.error('Falha ao carregar horários', e);
        }

        if (shopData) {
          setSettingsState({
            shopName: shopData.name ?? 'Salão',
            whatsapp: shopData.whatsapp ?? '',
            address: shopData.address ?? undefined,
            city: shopData.city ?? undefined,
            latitude: shopData.latitude ?? undefined,
            longitude: shopData.longitude ?? undefined,
            schedule,
            logoUrl: shopData.logoUrl ?? undefined,
          });
        } else {
          setSettingsState(null);
        }
      } catch (e) {
        logger.error('Falha ao carregar configurações do salão', e);
        setSettingsState(null);
      }

      setLoading(false);
    };
    load();
  }, [barbershopId, authLoading, user]);

  const setSettings = async (newSettings: ShopSettings) => {
    if (!barbershopId) return;
    const shopPayload: Record<string, string | number | undefined> = {
      name: newSettings.shopName,
      whatsapp: newSettings.whatsapp,
      address: newSettings.address,
      city: newSettings.city,
    };
    if (newSettings.logoUrl && !newSettings.logoUrl.startsWith('data:')) {
      shopPayload.logoUrl = newSettings.logoUrl;
    }
    if (newSettings.latitude !== undefined) shopPayload.latitude = newSettings.latitude;
    if (newSettings.longitude !== undefined) shopPayload.longitude = newSettings.longitude;
    await barbershopApi.updateBarbershop(barbershopId, shopPayload);
    await barbershopApi.updateSchedule(barbershopId, newSettings.schedule);
    setSettingsState(newSettings);
  };

  const addService = async (data: Omit<Service, 'id'>) => {
    if (!barbershopId) return;
    const newService = await barbershopApi.addService({ ...data, barbershopId });
    setServices(prev => [...prev, newService]);
  };

  const editService = async (id: string, data: Omit<Service, 'id'>) => {
    const updated = await barbershopApi.updateService(id, data);
    setServices(prev => prev.map(s => (s.id === id ? updated : s)));
  };

  const deleteService = async (id: string) => {
    await barbershopApi.deleteService(id);
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const updateTeam = async (team: StaffMember[]) => {
    if (!barbershopId) return;
    const currentIds = new Set(staff.map(member => member.id));
    const newIds = new Set(team.map(member => member.id));
    const toAdd = team.filter(member => !currentIds.has(member.id));
    const toRemove = staff.filter(member => !newIds.has(member.id));
    const toUpdate = team.filter(member => {
      if (!currentIds.has(member.id)) return false;
      const old = staff.find(s => s.id === member.id);
      if (!old) return false;
      return JSON.stringify(old.permissions) !== JSON.stringify(member.permissions);
    });
    await Promise.all([
      ...toAdd.map(member =>
        barbershopApi.addStaff({
          name: member.name,
          email: member.email,
          password: member.password,
          cpf: (member as StaffMember & { cpf?: string }).cpf,
          role: 'EMPLOYEE',
          barbershopId,
          permissions: member.permissions,
        })
      ),
      ...toRemove.map(member => barbershopApi.deleteStaff(member.id)),
      ...toUpdate.map(member =>
        barbershopApi.updateStaff(member.id, { permissions: member.permissions })
      ),
    ]);
    const staffData = await barbershopApi.listStaff(barbershopId);
    setStaff(Array.isArray(staffData) ? (staffData as Record<string, unknown>[]).map(mapStaffFromApi) : []);
  };

  const addPost = async (post: FeedPost) => {
    if (!barbershopId) return;
    const created = await barbershopApi.addPost({ ...post, barbershopId });
    setFeed(prev => [created, ...prev]);
  };

  const deletePost = async (id: string) => {
    await barbershopApi.deletePost(id);
    setFeed(prev => prev.filter(p => p.id !== id));
  };

  const likePost = async (id: string) => {
    const post = feed.find(p => p.id === id);
    if (!post) return;
    const updated = await barbershopApi.updatePost(id, { likes: post.likes + 1 } as Parameters<typeof barbershopApi.updatePost>[1]);
    setFeed(prev => prev.map(p => (p.id === id ? updated : p)));
  };

  const isShopOpen = () => {
    if (!settings?.schedule?.length) return false;
    const day = new Date().getDay();
    const today = settings.schedule[day];
    if (!today?.isOpen) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMinute] = today.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = today.closeTime.split(':').map(Number);
    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;
    if (!Number.isFinite(openMinutes) || !Number.isFinite(closeMinutes)) return true;
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  };

  const getTodayScheduleDisplay = () => {
    if (!settings?.schedule?.length) return '';
    const day = new Date().getDay();
    const today = settings.schedule[day];
    if (!today?.isOpen) return 'Fechado hoje';
    return `${today.openTime} - ${today.closeTime}`;
  };

  const value = useMemo(
    () => ({
      loading,
      services,
      staff,
      settings,
      feed,
      setSettings,
      addService,
      editService,
      deleteService,
      updateTeam,
      addPost,
      deletePost,
      likePost,
      isShopOpen,
      getTodayScheduleDisplay,
    }),
    [loading, services, staff, settings, feed]
  );

  return <BarbershopContext.Provider value={value}>{children}</BarbershopContext.Provider>;
};

export const useBarbershop = () => {
  const ctx = useContext(BarbershopContext);
  if (!ctx) throw new Error('useBarbershop must be used within BarbershopProvider');
  return ctx;
};
