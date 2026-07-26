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

export type PaymentProvider = 'MERCADOPAGO' | 'ABACATEPAY';

export interface Payment {
  id: string;
  mpPaymentId: string | null;
  provider?: PaymentProvider;
  providerPaymentId?: string | null;
  checkoutUrl?: string | null;
  status: PaymentStatus;
  statusDetail: string;
  paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'payment_link';
  transactionAmount: number;
  currency: string;
  description: string;
  barbershopId: string;
  externalReference: string | null;
  createdAt: string;
  updatedAt: string;
  pixQrCode: PixQrCode | null;
}

function unwrap<T>(res: any): T {
  if (res && typeof res === 'object' && 'data' in res) return res.data as T;
  return res as T;
}

const token = () => authStorage.getAccessToken() || '';

export const paymentsApi = {
  getStatus: (id: string, sync = false) =>
    apiClient<any>(`/api/payments/${id}${sync ? '?sync=true' : ''}`, 'GET', undefined, token()).then(res =>
      unwrap<Payment>(res)
    ),
  list: (page = 1, limit = 20) =>
    apiClient<{ success: boolean; data: Payment[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
      `/api/payments?page=${page}&limit=${limit}`,
      'GET',
      undefined,
      token()
    )
};
