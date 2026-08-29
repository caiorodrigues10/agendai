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
  responsibleQueueItemId?: string | null;
  responsibleName?: string | null;
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
  status: 'confirmed' | 'cancelled' | 'completed' | 'checked_in';
  serviceName?: string;
  staffName?: string;
  serviceDurationMinutes?: number;
  clientId?: string | null;
  clientPackageId?: string | null;
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

export type EmployeePermission =
  | 'QUEUE_MANAGE'
  | 'APPOINTMENTS_MANAGE'
  | 'APPOINTMENTS_VIEW_ALL'
  | 'APPOINTMENTS_CANCEL'
  | 'CLIENTS_MANAGE'
  | 'PACKAGES_SELL'
  | 'FINANCE_VIEW'
  | 'FINANCE_MANAGE'
  | 'REPORTS_VIEW'
  | 'MARKETING_MANAGE';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: StaffRole;
  barbershopId?: string;
  emailVerified?: boolean;
  avatarUrl?: string | null;
  permissions?: EmployeePermission[];
}

export interface FeedPost {
  id: string;
  barbershopId?: string;
  type: 'haircut' | 'beard' | 'announcement';
  title?: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: number;
  likes: number;
  authorName?: string;
  status?: 'draft' | 'scheduled' | 'published';
  scheduledFor?: number | null;
  publishedAt?: number | null;
  postMode?: 'queue' | 'appointments' | 'both';
  ctaText?: string | null;
}

export type PostMode = 'queue' | 'appointments' | 'both';

export interface PostConfig {
  autoPostEnabled: boolean;
}

export type PackagePaymentMethod = 'cash' | 'pix' | 'card' | 'other';
export type ClientPackageStatus = 'ACTIVE' | 'DEPLETED' | 'EXPIRED' | 'CANCELLED';

export interface ServicePackage {
  id: string;
  barbershopId: string;
  serviceId: string;
  serviceName: string | null;
  servicePrice: number | null;
  name: string;
  sessionCount: number;
  price: number;
  validityDays: number | null;
  active: boolean;
}

export interface ClientPackage {
  id: string;
  barbershopId: string;
  clientId: string;
  clientName: string | null;
  clientWhatsapp: string | null;
  packageId: string;
  packageName: string | null;
  serviceId: string;
  serviceName: string | null;
  serviceDurationMinutes: number | null;
  totalSessions: number;
  remainingSessions: number;
  pricePaid: number;
  paymentMethod: PackagePaymentMethod;
  status: ClientPackageStatus;
  purchasedAt: string;
  expiresAt: string | null;
}

export interface SalonClientPackageSummary {
  id: string;
  packageId: string;
  packageName: string | null;
  serviceId: string;
  serviceName: string | null;
  totalSessions: number;
  remainingSessions: number;
  status: string;
  purchasedAt: string;
  expiresAt: string | null;
  pricePaid: number;
  paymentMethod: string;
}

export interface SalonClientAppointment {
  id: string;
  serviceId: string;
  serviceName: string | null;
  date: string;
  time: string;
  status: string;
  clientPackageId: string | null;
}

export interface SalonClient {
  id: string;
  barbershopId: string;
  name: string;
  whatsapp: string;
  notes: string | null;
  remainingSessions: number;
  activePackageCount: number;
  createdAt: string;
  updatedAt: string;
  packages?: SalonClientPackageSummary[];
  appointments?: SalonClientAppointment[];
}
