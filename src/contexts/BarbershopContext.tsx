import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { barbershopApi } from '../infra/barbershopApi';
import { StaffMember, Service, ShopSettings, FeedPost } from '../types';
import { useBarbershopFilters } from './BarbershopFiltersContext';
import { useAuth } from './AuthContext';

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

export const BarbershopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { barbershopId, setBarbershopId } = useBarbershopFilters();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [settings, setSettingsState] = useState<ShopSettings | null>(null);
  const [feed, setFeed] = useState<FeedPost[]>([]);

  useEffect(() => {
    if (user?.barbershopId && !barbershopId) {
      setBarbershopId(user.barbershopId);
    }
  }, [user, barbershopId, setBarbershopId]);

  useEffect(() => {
    const ensureDefaultShop = async () => {
      if (barbershopId) return;
      try {
        const shops = await barbershopApi.listBarbershops();
        if (shops?.[0]?.id) {
          setBarbershopId(shops[0].id);
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    };
    ensureDefaultShop();
  }, [barbershopId, setBarbershopId]);

  useEffect(() => {
    const load = async () => {
      if (!barbershopId) {
        setLoading(false);
        return;
      }
      setLoading(true);

      try {
        const servicesData = await barbershopApi.listServices(barbershopId);
        setServices(servicesData as Service[]);
      } catch (e) {
        console.error('Falha ao carregar serviços', e);
        setServices([]);
      }

      try {
        const staffData = await barbershopApi.listStaff(barbershopId);
        setStaff(staffData as StaffMember[]);
      } catch (e) {
        console.error('Falha ao carregar equipe', e);
        setStaff([]);
      }

      try {
        const feedData = await barbershopApi.listFeed(barbershopId);
        setFeed(feedData as FeedPost[]);
      } catch (e) {
        console.error('Falha ao carregar feed', e);
        setFeed([]);
      }

      try {
        const shopData = await barbershopApi.getBarbershop(barbershopId);
        if (shopData) {
          setSettingsState({
            shopName: shopData.name,
            whatsapp: shopData.whatsapp,
            schedule: shopData.schedule,
            logoUrl: shopData.logoUrl
          });
        }
      } catch (e) {
        console.error('Falha ao carregar configurações da barbearia', e);
        // Não usar mock settings
      }

      setLoading(false);
    };
    load();
  }, [barbershopId]);

  const setSettings = async (newSettings: ShopSettings) => {
    if (!barbershopId) return;
    const payload = {
      name: newSettings.shopName,
      whatsapp: newSettings.whatsapp,
      schedule: newSettings.schedule,
      logoUrl: newSettings.logoUrl
    };
    await barbershopApi.updateBarbershop(barbershopId, payload);
    setSettingsState(newSettings);
  };

  const addService = async (data: Omit<Service, 'id'>) => {
    if (!barbershopId) return;
    const newService = await barbershopApi.addService({ ...data, barbershopId });
    setServices(prev => [...prev, newService]);
  };

  const editService = async (id: string, data: Omit<Service, 'id'>) => {
    const updated = await barbershopApi.updateService(id, data);
    setServices(prev => prev.map(s => s.id === id ? updated : s));
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
    await Promise.all([
      ...toAdd.map(member => barbershopApi.addStaff({ ...member, barbershopId })),
      ...toRemove.map(member => barbershopApi.deleteStaff(member.id))
    ]);
    setStaff(team.map(member => ({ ...member, barbershopId })));
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
    const updated = await barbershopApi.updatePost(id, { likes: post.likes + 1 });
    setFeed(prev => prev.map(p => p.id === id ? updated : p));
  };

  const isShopOpen = () => {
    if (!settings?.schedule?.length) return false;
    const day = new Date().getDay();
    const today = settings.schedule[day];
    return !!today?.isOpen;
  };

  const getTodayScheduleDisplay = () => {
    if (!settings?.schedule?.length) return '';
    const day = new Date().getDay();
    const today = settings.schedule[day];
    if (!today?.isOpen) return 'Fechado hoje';
    return `${today.openTime} - ${today.closeTime}`;
  };

  const value = useMemo(() => ({
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
    getTodayScheduleDisplay
  }), [loading, services, staff, settings, feed]);

  return <BarbershopContext.Provider value={value}>{children}</BarbershopContext.Provider>;
};

export const useBarbershop = () => {
  const ctx = useContext(BarbershopContext);
  if (!ctx) throw new Error('useBarbershop must be used within BarbershopProvider');
  return ctx;
};
