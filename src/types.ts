export interface Service {
  categoryId?: string | null;
  categoryName?: string | null;
  id: string;
  name: string;
  price: number;
  avgTimeMinutes: number;
  icon: string;
  barbershopId?: string;
  commissionPercent?: number;
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
  paymentMethod?: 'pix' | 'credit_card' | 'debit_card' | 'fiado';
  customerId?: string;
  clientId?: string | null;
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
    status: 'confirmed' | 'cancelled' | 'completed' | 'checked_in' | 'no_show';
  /** Origem do agendamento — "WHATSAPP_OWNER_BOT" = criado pelo assistente do dono. */
  source?: 'APP' | 'PUBLIC' | 'WHATSAPP_OWNER_BOT';
  serviceName?: string;
  staffName?: string;
  serviceDurationMinutes?: number;
  clientId?: string | null;
  clientPackageId?: string | null;
  reservedProducts?: {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    imageUrl?: string | null;
  }[];
}

export interface DaySchedule {
  dayName: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export type OperationMode = 'QUEUE_ONLY' | 'APPOINTMENTS_ONLY' | 'HYBRID';
export type OpeningMode = 'SCHEDULE' | 'MANUAL';
// Derivado do config central: a union à mão já ficou para trás (faltava PETSHOP)
// e quebrava Records como o de ícones do catálogo de produtos.
export type { BusinessSegment, TargetAudience } from './shared/segments';
import type { BusinessSegment, TargetAudience } from './shared/segments';
export type ManualShopStatus = 'AUTO' | 'OPEN' | 'CLOSED';

export interface ShopOpenState {
  open: boolean;
  reason: string;
  queueClosed: boolean;
}

export interface ShopSettings {
  shopName: string;
  whatsapp: string;
  schedule: DaySchedule[];
  logoUrl?: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  operationMode?: OperationMode;
  openingMode?: OpeningMode;
  businessSegment?: BusinessSegment;
  /** Público atendido. Em PETSHOP não se aplica (o backend zera). */
  targetAudience?: TargetAudience | null;
  manualStatus?: ManualShopStatus;
  openState?: ShopOpenState;
  googleReviewUrl?: string | null;
  /** Redes sociais do dono no perfil público: mapa rede → URL canônica. */
  socialLinks?: import('./utils/socialLinks').SocialLinks | null;
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
  | 'FINANCE_CREATE'
  | 'FINANCE_EDIT'
  | 'FINANCE_MANAGE'
  | 'REPORTS_VIEW'
  | 'MARKETING_MANAGE'
  | 'CRM_ANALYTICS_VIEW'
  | 'CRM_CAMPAIGNS_MANAGE'
  | 'PRODUCTS_VIEW'
  | 'PRODUCTS_MANAGE'
  | 'INVENTORY_MANAGE'
  | 'RETAIL_SELL'
  | 'RETAIL_REFUND'
  | 'PRODUCT_REPORTS_VIEW';

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

/** Item da lista de preços do modelo price-split (o backend normaliza o preço). */
export interface PriceSplitItem {
  name: string;
  /** Texto do editor ("45,90") ou número; null/'' = sem preço. */
  price?: number | string | null;
}

/** Payload do modelo "Tabela de valores · Foto + painel" (até 8 itens). */
export interface PriceSplitPayload {
  items: PriceSplitItem[];
  businessName?: string;
  whatsapp?: string | null;
  instagram?: string | null;
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
  commentsCount?: number;
  authorName?: string;
  status?: 'draft' | 'published';
  publishedAt?: number | null;
  postMode?: 'queue' | 'appointments' | 'both';
  ctaText?: string | null;
  templateKey?: string;
  format?: 'square' | 'portrait' | 'story';
  primaryMediaId?: string | null;
  secondaryMediaId?: string | null;
  paletteKey?: string;
  designOptions?: {
    focalX?: number;
    focalY?: number;
    overlay?: number;
    /** Lista de preços gravada junto ao post (só no modelo price-split). */
    priceSplit?: PriceSplitPayload;
  } | null;
}

export type PostMode = 'queue' | 'appointments' | 'both';

export interface PostConfig {
  autoPostEnabled: boolean;
}

export type PostFormat = 'square' | 'portrait' | 'story';
export interface PostTemplate {
  key: string;
  name: string;
  description: string;
  previewUrl: string;
  requiredMedia: 0 | 1 | 2;
  formats: PostFormat[];
}
export interface PostMedia {
  id: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
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
