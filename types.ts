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
  joinedAt: number; // Timestamp
  status: 'waiting' | 'in_chair' | 'completed' | 'cancelled';
  estimatedStartTime?: number;
  addedByStaff?: boolean; // New: to track walk-ins
  
  // Historical Data for Dashboard
  completedAt?: number;
  completedBy?: string; // Staff ID who finished the service
  finalPrice?: number; // Snapshot of price at time of completion
}

export interface ShopStats {
  totalServedToday: number;
  totalRevenue: number;
  avgWaitTime: number;
}

export interface DaySchedule {
  dayName: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface ShopSettings {
  shopName: string;
  schedule: DaySchedule[]; // Index 0 = Sunday, 6 = Saturday
  logoUrl?: string; // New: Generated AI Logo
}

export interface AIInsight {
  estimatedWait: string;
  message: string;
  busyLevel: 'low' | 'medium' | 'high';
}

// New Types for Staff/Auth
export type StaffRole = 'admin' | 'barber';

export interface StaffMember {
  id: string;
  name: string;
  pin: string; // Simple 4-6 digit pin for login
  role: StaffRole;
}

// Feed Types
export interface FeedPost {
  id: string;
  type: 'haircut' | 'beard' | 'announcement';
  content: string; // Text description
  imageUrl?: string;
  createdAt: number;
  likes: number;
  authorName?: string;
}