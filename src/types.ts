export enum ServiceType {
  HAIRCUT = 'Corte',
  BEARD = 'Barba',
  FULL_SERVICE = 'Corte + Escova',
  EYEBROW = 'Sobrancelha'
}

export interface Service {
  id: string;
  name: string;
  price: number;
  avgTimeMinutes: number;
  icon: string;
  barbershopId?: string;
}

export interface QueueItem {
  id: string;
  barbershopId?: string;
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
  customerId?: string;
}

export interface Appointment {
  id: string;
  barbershopId?: string;
  customerName: string;
  whatsapp: string;
  serviceId: string;
  staffId: string;
  date: string;
  time: string;
  createdAt: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  serviceName?: string;
  staffName?: string;
  serviceDurationMinutes?: number;
}

export interface DaySchedule {
  dayName: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface ShopSettings {
  shopName: string;
  whatsapp: string;
  schedule: DaySchedule[];
  logoUrl?: string;
  address?: string;
}

export interface AIInsight {
  estimatedWait: string;
  message: string;
  busyLevel: 'low' | 'medium' | 'high';
}

export type StaffRole = 'MASTER_ADMIN' | 'OWNER' | 'EMPLOYEE' | 'CUSTOMER';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: StaffRole;
  barbershopId?: string;
}

export interface FeedPost {
  id: string;
  barbershopId?: string;
  type: 'haircut' | 'beard' | 'announcement';
  title?: string;
  content: string;
  imageUrl?: string;
  createdAt: number;
  likes: number;
  authorName?: string;
}
