import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export interface PurchaseOrder {
  id: string;
  barbershopId: string;
  supplierId?: string | null;
  supplier?: { id: string; name: string } | null;
  status: string;
  totalAmount: number;
  expectedAt?: string | null;
  notes?: string | null;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  productId?: string | null;
}

export const purchasingApi = {
  listOrders: (barbershopId: string, params?: { status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString();
    return apiClient<{ success: boolean; data: PurchaseOrder[] }>(
      `/api/barbershops/${barbershopId}/purchase-orders${query ? '?' + query : ''}`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<PurchaseOrder[]>(r));
  },

  getOrder: (barbershopId: string, orderId: string) =>
    apiClient<{ success: boolean; data: PurchaseOrder }>(
      `/api/barbershops/${barbershopId}/purchase-orders/${orderId}`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<PurchaseOrder>(r)),

  createOrder: (barbershopId: string, data: {
    supplierId?: string;
    notes?: string;
    expectedAt?: string;
  }) =>
    apiClient<{ success: boolean; data: PurchaseOrder }>(
      `/api/barbershops/${barbershopId}/purchase-orders`,
      'POST',
      { barbershopId, ...data },
      token()
    ).then(r => unwrap<PurchaseOrder>(r)),

  updateOrder: (barbershopId: string, orderId: string, data: Partial<PurchaseOrder>) =>
    apiClient<{ success: boolean; data: PurchaseOrder }>(
      `/api/barbershops/${barbershopId}/purchase-orders/${orderId}`,
      'PATCH',
      data,
      token()
    ).then(r => unwrap<PurchaseOrder>(r)),

  addItem: (barbershopId: string, orderId: string, data: {
    description: string;
    quantity: number;
    unitPrice: number;
    productId?: string;
  }) =>
    apiClient<{ success: boolean; data: PurchaseOrderItem }>(
      `/api/barbershops/${barbershopId}/purchase-orders/${orderId}/items`,
      'POST',
      data,
      token()
    ).then(r => unwrap<PurchaseOrderItem>(r)),

  receiveOrder: (barbershopId: string, orderId: string, data?: {
    items?: { itemId: string; receivedQuantity: number }[];
  }) =>
    apiClient<{ success: boolean; data: PurchaseOrder }>(
      `/api/barbershops/${barbershopId}/purchase-orders/${orderId}/receive`,
      'POST',
      data ?? {},
      token()
    ).then(r => unwrap<PurchaseOrder>(r)),
};
