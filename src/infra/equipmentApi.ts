import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

// ─── Types ───────────────────────────────────────────────────

export interface Equipment {
  id: string;
  barbershopId: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  quantityTotal: number;
  quantityAvailable: number;
  condition: string;
  minQuantity: number;
  unitCost: number | null;
  supplier: string | null;
  purchaseDate: string | null;
  warrantyUntil: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  barbershop?: { id: string; name: string };
}

export interface EquipmentMovement {
  id: string;
  equipmentId: string | null;
  barbershopId: string;
  type: string;
  quantity: number;
  reason: string | null;
  staffId: string | null;
  createdAt: string;
  equipment: { id: string; name: string; category: string } | null;
  staff: { id: string; name: string } | null;
}

export interface EquipmentNeed {
  id: string;
  barbershopId: string;
  equipmentId: string | null;
  name: string;
  quantityNeeded: number;
  priority: string;
  reason: string | null;
  estimatedCost: number | null;
  status: string;
  requestedBy: string | null;
  createdAt: string;
  resolvedAt: string | null;
  equipment?: { id: string; name: string; category: string };
  requester?: { id: string; name: string };
}

export interface EquipmentDashboard {
  totalEquipment: number;
  activeEquipment: number;
  lowStockCount: number;
  pendingNeeds: number;
  recentMovements: number;
  lowStockItems: {
    id: string;
    name: string;
    category: string;
    quantityTotal: number;
    quantityAvailable: number;
    minQuantity: number;
    condition: string;
  }[];
  pendingNeedsList: EquipmentNeed[];
  recentNeeds: EquipmentNeed[];
}

// ─── API ─────────────────────────────────────────────────────

/** Convert UPPERCASE/UPPER_CASE enum keys from UI/Prisma to the lowercase values the Zod schemas expect. */
const toSchema = (v?: string | null) => v?.toLowerCase() ?? undefined;

/** Convert empty strings to undefined so optional UUID fields don't send ''. */
const emptyToUndefined = (v?: string) => (v && v.trim() !== '' ? v : undefined);

export const equipmentApi = {
  // ─── Equipment CRUD ──────────────────────────────────────

  list: (barbershopId: string, params?: { category?: string; isActive?: boolean; condition?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', toSchema(params.category)!);
    if (params?.isActive !== undefined) qs.set('isActive', String(params.isActive));
    if (params?.condition) qs.set('condition', toSchema(params.condition)!);
    if (params?.search) qs.set('search', params.search);
    const query = qs.toString();
    return apiClient<{ success: boolean; data: Equipment[] }>(
      `/api/barbershops/${barbershopId}/equipment${query ? '?' + query : ''}`,
      'GET', undefined, token()
    ).then(r => unwrap<Equipment[]>(r));
  },

  get: (barbershopId: string, id: string) =>
    apiClient<{ success: boolean; data: Equipment }>(
      `/api/barbershops/${barbershopId}/equipment/${id}`,
      'GET', undefined, token()
    ).then(r => unwrap<Equipment>(r)),

  create: (barbershopId: string, data: {
    name: string;
    category?: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    quantityTotal?: number;
    quantityAvailable?: number;
    condition?: string;
    minQuantity?: number;
    unitCost?: number;
    supplier?: string;
    notes?: string;
  }) =>
    apiClient<{ success: boolean; data: Equipment }>(
      `/api/barbershops/${barbershopId}/equipment`,
      'POST', { ...data, category: toSchema(data.category), condition: toSchema(data.condition) }, token()
    ).then(r => unwrap<Equipment>(r)),

  update: (barbershopId: string, id: string, data: Partial<Equipment>) => {
    const { category, condition, ...rest } = data;
    return apiClient<{ success: boolean; data: Equipment }>(
      `/api/barbershops/${barbershopId}/equipment/${id}`,
      'PATCH', { ...rest, ...(category !== undefined && { category: toSchema(category) }), ...(condition !== undefined && { condition: toSchema(condition) }) }, token()
    ).then(r => unwrap<Equipment>(r));
  },

  remove: (barbershopId: string, id: string) =>
    apiClient<{ success: boolean }>(
      `/api/barbershops/${barbershopId}/equipment/${id}`,
      'DELETE', undefined, token()
    ),

  // ─── Movements ───────────────────────────────────────────

  listMovements: (barbershopId: string, params?: { equipmentId?: string; type?: string; dateFrom?: string; dateTo?: string }) => {
    const qs = new URLSearchParams();
    if (params?.equipmentId) qs.set('equipmentId', params.equipmentId);
    if (params?.type) qs.set('type', toSchema(params.type)!);
    if (params?.dateFrom) qs.set('dateFrom', params.dateFrom);
    if (params?.dateTo) qs.set('dateTo', params.dateTo);
    const query = qs.toString();
    return apiClient<{ success: boolean; data: EquipmentMovement[] }>(
      `/api/barbershops/${barbershopId}/equipment-movements${query ? '?' + query : ''}`,
      'GET', undefined, token()
    ).then(r => unwrap<EquipmentMovement[]>(r));
  },

  createMovement: (barbershopId: string, data: {
    equipmentId: string;
    type: string;
    quantity: number;
    reason?: string;
  }) =>
    apiClient<{ success: boolean; data: EquipmentMovement }>(
      `/api/barbershops/${barbershopId}/equipment-movements`,
      'POST', { ...data, type: toSchema(data.type)! }, token()
    ).then(r => unwrap<EquipmentMovement>(r)),

  // ─── Needs ───────────────────────────────────────────────

  listNeeds: (barbershopId: string, params?: { status?: string; priority?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', toSchema(params.status)!);
    if (params?.priority) qs.set('priority', toSchema(params.priority)!);
    const query = qs.toString();
    return apiClient<{ success: boolean; data: EquipmentNeed[] }>(
      `/api/barbershops/${barbershopId}/equipment-needs${query ? '?' + query : ''}`,
      'GET', undefined, token()
    ).then(r => unwrap<EquipmentNeed[]>(r));
  },

  createNeed: (barbershopId: string, data: {
    equipmentId?: string;
    name: string;
    quantityNeeded?: number;
    priority?: string;
    reason?: string;
    estimatedCost?: number;
  }) =>
    apiClient<{ success: boolean; data: EquipmentNeed }>(
      `/api/barbershops/${barbershopId}/equipment-needs`,
      'POST', { ...data, equipmentId: emptyToUndefined(data.equipmentId), priority: toSchema(data.priority) }, token()
    ).then(r => unwrap<EquipmentNeed>(r)),

  updateNeed: (barbershopId: string, needId: string, data: { status?: string; priority?: string; reason?: string; estimatedCost?: number }) => {
    const { status, priority, ...rest } = data;
    return apiClient<{ success: boolean; data: EquipmentNeed }>(
      `/api/barbershops/${barbershopId}/equipment-needs/${needId}`,
      'PATCH', { ...rest, ...(status !== undefined && { status: toSchema(status) }), ...(priority !== undefined && { priority: toSchema(priority) }) }, token()
    ).then(r => unwrap<EquipmentNeed>(r));
  },

  // ─── Dashboard ───────────────────────────────────────────

  dashboard: (barbershopId: string) =>
    apiClient<{ success: boolean; data: EquipmentDashboard }>(
      `/api/barbershops/${barbershopId}/equipment-dashboard`,
      'GET', undefined, token()
    ).then(r => unwrap<EquipmentDashboard>(r)),
};
