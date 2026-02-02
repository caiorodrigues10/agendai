export enum ServiceType {
  HAIRCUT = 'Corte de Cabelo',
  BEARD = 'Barba',
  FULL_SERVICE = 'Cabelo + Barba',
  EYEBROW = 'Sobrancelha'
}

export interface Service {
  id: string;
  name: string;
  price: number;
  avgTimeMinutes: number;
  icon: string;
}

export interface QueueItem {
  id: string;
  customerName: string;
  whatsapp: string; 
  serviceId: string;
  joinedAt: number;
  status: 'waiting' | 'in_chair' | 'completed' | 'cancelled';
  estimatedStartTime?: number;
  addedByStaff?: boolean;
  completedAt?: number;
  completedBy?: string;
  finalPrice?: number;
}

export interface Appointment {
  id: string;
  customerName: string;
  whatsapp: string;
  serviceId: string;
  staffId: string;
  date: string;
  time: string;
  createdAt: number;
  status: 'confirmed' | 'cancelled' | 'completed';
}

export interface DaySchedule {
  dayName: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface ShopSettings {
  shopName: string;
  schedule: DaySchedule[];
  logoUrl?: string;
}

export interface AIInsight {
  estimatedWait: string;
  message: string;
  busyLevel: 'low' | 'medium' | 'high';
}

export type StaffRole = 'admin' | 'barber';

export interface StaffMember {
  id: string;
  name: string;
  pin: string;
  role: StaffRole;
}

export interface FeedPost {
  id: string;
  type: 'haircut' | 'beard' | 'announcement';
  title?: string;
  content: string;
  imageUrl?: string;
  createdAt: number;
  likes: number;
  authorName?: string;
}

// Data Context Interface
export interface ShopContextType {
  // State
  currentUser: StaffMember | null;
  queue: QueueItem[];
  services: Service[];
  settings: ShopSettings;
  staff: StaffMember[];
  feed: FeedPost[];
  appointments: Appointment[];
  ownedIds: string[];
  aiInsight: AIInsight | null;
  loading: boolean;

  // Actions
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
  joinQueue: (name: string, whatsapp: string, serviceId: string, isManual?: boolean) => Promise<void>;
  leaveQueue: (id: string) => Promise<void>;
  updateQueueStatus: (id: string, status: QueueItem['status']) => Promise<void>;
  deleteHistoryItem: (id: string) => Promise<void>;
  
  // CRUD Actions
  addService: (data: Omit<Service, 'id'>) => Promise<void>;
  editService: (id: string, data: Omit<Service, 'id'>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  
  saveSettings: (settings: ShopSettings) => Promise<void>;
  updateTeam: (team: StaffMember[]) => Promise<void>;
  
  // Feed & Appointments
  addPost: (post: FeedPost) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  likePost: (id: string) => Promise<void>;
  
  bookAppointment: (data: any) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  checkInAppointment: (appt: Appointment) => Promise<void>;
  
  // Utils
  isShopOpen: () => boolean;
  getTodayScheduleDisplay: () => string;
}
