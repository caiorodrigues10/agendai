import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

export type PaymentStatus =
  | 'pending'
  | 'approved'
  | 'authorized'
  | 'in_process'
  | 'in_mediation'
  | 'rejected'
  | 'cancelled'
  | 'refunded'
  | 'charged_back';

export interface PixQrCode {
  qrCode: string;
  qrCodeBase64: string;
  expirationDate: string;
}

export type PaymentProvider = 'MERCADOPAGO' | 'ABACATEPAY' | 'ASAAS';

export interface Payment {
  id: string;
  mpPaymentId: string | null;
  provider?: PaymentProvider;
  providerPaymentId?: string | null;
  checkoutUrl?: string | null;
  status: PaymentStatus;
  statusDetail: string;
  paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'payment_link' | 'asaas';
  transactionAmount: number;
  currency: string;
  description: string;
  barbershopId: string;
  externalReference: string | null;
  createdAt: string;
  updatedAt: string;
  pixQrCode: PixQrCode | null;
}

export interface Refund {
  id: string;
  paymentId: string;
  barbershopId: string;
  amount: number;
  reason: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
  provider: 'ABACATEPAY' | 'MERCADOPAGO' | 'ASAAS';
  providerRefundId: string | null;
  requestedById: string | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

interface ListMeta { total: number; page: number; limit: number; totalPages: number }
type RefundListResponse = { success: boolean; data: Refund[]; meta: ListMeta } | Refund[];

const token = () => authStorage.getAccessToken() || '';

export const paymentsApi = {
  getStatus: (id: string, sync = false) =>
    apiClient<{ success: boolean; data: Payment }>(
      `/api/payments/${id}${sync ? '?sync=true' : ''}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<Payment>(res)),
  list: (page = 1, limit = 20) =>
    apiClient<{ success: boolean; data: Payment[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
      `/api/payments?page=${page}&limit=${limit}`,
      'GET',
      undefined,
      token()
    ),
  refundPayment: (paymentId: string, reason: string) =>
    apiClient<{ success: boolean; data: Refund }>(
      `/api/payments/${paymentId}/refund`,
      'POST',
      { reason },
      token()
    ).then(res => unwrap<Refund>(res)),
  listRefunds: async (params?: { barbershopId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.barbershopId) qs.set('barbershopId', params.barbershopId);
    const query = qs.toString();
    const res = await apiClient<RefundListResponse>(
      `/api/refunds${query ? `?${query}` : ''}`,
      'GET',
      undefined,
      token()
    );
    const body = unwrap<Refund[]>(res);
    const data = Array.isArray(body) ? body : Array.isArray((body as { data?: Refund[] })?.data) ? (body as { data: Refund[] }).data : [];
    const meta = !Array.isArray(res) ? (res as { meta?: ListMeta }).meta : (body as { meta?: ListMeta })?.meta;
    return { data: data as Refund[], meta };
  }
};
