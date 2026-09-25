import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

// ---------------------------------------------------------------------------
// Vocabulário do FE (mantido para a UI)
// ---------------------------------------------------------------------------

export interface Voucher {
  id: string;
  barbershopId: string;
  code: string;
  description?: string;
  type: string;
  value: number;
  minPurchase?: number;
  maxUses?: number;
  currentUses: number;
  perClientLimit?: number;
  validFrom: string;
  validUntil: string;
  status: string;
  applicableServiceIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VoucherUsage {
  id: string;
  voucherId: string;
  clientId?: string;
  clientName?: string;
  appointmentId?: string;
  amount: number;
  createdAt: string;
}

export interface VoucherInput {
  description?: string;
  code?: string;
  type: string;
  value: number;
  minPurchase?: number;
  maxUses?: number;
  perClientLimit?: number;
  validFrom?: string;
  validUntil: string;
}

export interface VoucherValidationResult {
  valid: boolean;
  discount?: number;
  message?: string;
}

export interface VoucherApplyResult {
  voucherId: string;
  code: string;
  discountAmount: number;
  finalAmount: number;
}

// ---------------------------------------------------------------------------
// Contrato do backend (BE: voucherSchema.ts / voucherRepository.ts)
// ---------------------------------------------------------------------------

interface BackendVoucher {
  id: string;
  barbershopId: string;
  code: string;
  description: string | null;
  type: string;
  value: number | string;
  minPurchase?: number | string | null;
  maxUses: number | null;
  usedCount: number;
  perClientLimit: number;
  applicableServiceIds?: string[] | null;
  startAt: string;
  endAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BackendValidation {
  voucherId: string;
  code: string;
  type: string;
  value: number | string;
  applicable: boolean;
  reason?: string;
}

interface BackendUsage {
  id: string;
  voucherId: string;
  clientId: string | null;
  appointmentId: string | null;
  discountAmount: number | string;
  usedAt: string;
  client?: { id: string; name: string } | null;
}

const TYPE_TO_FE: Record<string, string> = {
  PERCENT: 'PERCENTAGE',
  FIXED: 'FIXED',
  FREE_SERVICE: 'FREE_SERVICE',
  BUY_X_GET_Y: 'BUY_X_GET_Y',
};

const TYPE_TO_BE: Record<string, string> = {
  PERCENTAGE: 'percent',
  FIXED: 'fixed',
  FREE_SERVICE: 'free_service',
  BUY_X_GET_Y: 'buy_x_get_y',
};

function fromBackendVoucher(raw: BackendVoucher): Voucher {
  const status = !raw.isActive
    ? 'INACTIVE'
    : new Date(raw.endAt).getTime() < Date.now()
      ? 'EXPIRED'
      : 'ACTIVE';
  return {
    id: raw.id,
    barbershopId: raw.barbershopId,
    code: raw.code,
    description: raw.description ?? undefined,
    type: TYPE_TO_FE[raw.type] ?? raw.type,
    value: Number(raw.value),
    minPurchase: raw.minPurchase != null ? Number(raw.minPurchase) : undefined,
    maxUses: raw.maxUses ?? undefined,
    currentUses: raw.usedCount,
    perClientLimit: raw.perClientLimit ?? undefined,
    validFrom: raw.startAt,
    validUntil: raw.endAt,
    status,
    applicableServiceIds: raw.applicableServiceIds ?? undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function dateOnlyToIso(dateStr: string, endOfDay: boolean): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(
    y,
    (m || 1) - 1,
    d || 1,
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 999 : 0,
  ).toISOString();
}

function todayStartIso(): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function computeDiscount(beType: string, value: number, amount: number): number {
  let discount = 0;
  switch (beType) {
    case 'PERCENT':
      discount = amount * (value / 100);
      break;
    case 'FIXED':
      discount = Math.min(value, amount);
      break;
    case 'FREE_SERVICE':
      discount = amount;
      break;
    case 'BUY_X_GET_Y':
      discount = value;
      break;
  }
  discount = Math.round(discount * 100) / 100;
  return Math.min(discount, amount);
}

function toCreateBody(data: VoucherInput) {
  return {
    code: (data.code?.trim() || generateCode()).toUpperCase(),
    description: data.description?.trim() || null,
    type: TYPE_TO_BE[data.type] ?? data.type,
    value: data.value,
    minPurchase: data.minPurchase ?? null,
    maxUses: data.maxUses ?? null,
    perClientLimit: data.perClientLimit ?? 1,
    applicableServiceIds: null as string[] | null,
    startAt: data.validFrom ? dateOnlyToIso(data.validFrom, false) : todayStartIso(),
    endAt: dateOnlyToIso(data.validUntil, true),
    isActive: true,
  };
}

function toUpdateBody(data: VoucherInput) {
  return {
    code: (data.code?.trim() || generateCode()).toUpperCase(),
    description: data.description?.trim() || null,
    type: TYPE_TO_BE[data.type] ?? data.type,
    value: data.value,
    minPurchase: data.minPurchase ?? null,
    maxUses: data.maxUses ?? null,
    ...(data.perClientLimit != null && { perClientLimit: data.perClientLimit }),
    ...(data.validFrom ? { startAt: dateOnlyToIso(data.validFrom, false) } : {}),
    endAt: dateOnlyToIso(data.validUntil, true),
  };
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const vouchersApi = {
  list: (barbershopId: string) =>
    apiClient<{ data: BackendVoucher[] }>(
      `/api/barbershops/${barbershopId}/vouchers`,
      'GET', undefined, token()
    ).then(r => unwrap<BackendVoucher[]>(r).map(fromBackendVoucher)),

  create: (barbershopId: string, data: VoucherInput) =>
    apiClient<{ data: BackendVoucher }>(
      `/api/barbershops/${barbershopId}/vouchers`,
      'POST', toCreateBody(data), token()
    ).then(r => fromBackendVoucher(unwrap<BackendVoucher>(r))),

  update: (barbershopId: string, voucherId: string, data: VoucherInput) =>
    apiClient<{ data: BackendVoucher }>(
      `/api/barbershops/${barbershopId}/vouchers/${voucherId}`,
      'PATCH', toUpdateBody(data), token()
    ).then(r => fromBackendVoucher(unwrap<BackendVoucher>(r))),

  remove: (barbershopId: string, voucherId: string) =>
    apiClient<{ success: boolean }>(
      `/api/barbershops/${barbershopId}/vouchers/${voucherId}`,
      'DELETE', undefined, token()
    ),

  validate: (barbershopId: string, code: string, data?: {
    serviceId?: string;
    clientId?: string;
    purchaseAmount?: number;
  }) =>
    apiClient<{ data: BackendValidation }>(
      `/api/barbershops/${barbershopId}/vouchers/validate`,
      'POST',
      { code, serviceId: data?.serviceId, clientId: data?.clientId },
      token()
    ).then(r => {
      const raw = unwrap<BackendValidation>(r);
      const valid = raw.applicable;
      const discount =
        valid && data?.purchaseAmount != null
          ? computeDiscount(raw.type, Number(raw.value), data.purchaseAmount)
          : undefined;
      return { valid, discount, message: raw.reason } as VoucherValidationResult;
    }),

  apply: (barbershopId: string, voucherId: string, data: {
    amount: number;
    clientId?: string;
    appointmentId?: string;
  }) =>
    apiClient<{ data: VoucherApplyResult }>(
      `/api/barbershops/${barbershopId}/vouchers/${voucherId}/apply`,
      'POST',
      {
        voucherId,
        originalAmount: data.amount,
        clientId: data.clientId ?? null,
        appointmentId: data.appointmentId ?? null,
      },
      token()
    ).then(r => unwrap<VoucherApplyResult>(r)),

  listUsages: (barbershopId: string, voucherId: string) =>
    apiClient<{ data: BackendUsage[] }>(
      `/api/barbershops/${barbershopId}/vouchers/${voucherId}/usages`,
      'GET', undefined, token()
    ).then(r =>
      unwrap<BackendUsage[]>(r).map(u => ({
        id: u.id,
        voucherId: u.voucherId,
        clientId: u.clientId ?? undefined,
        clientName: u.client?.name ?? undefined,
        appointmentId: u.appointmentId ?? undefined,
        amount: Number(u.discountAmount),
        createdAt: u.usedAt,
      }))
    ),
};
