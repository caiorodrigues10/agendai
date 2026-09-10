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
  supplier: string;
  status: string;
  totalAmount: number;
  expectedDate?: string;
  notes?: string;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  received: number;
}

export const purchasingApi = {
  listOrders: (barbershopId: string, params?: { status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString();
    return apiClient<{ success: boolean; data: PurchaseOrder[] }>(
      `/api/barbershops/${barbershopId}/purchasing/orders${query ? '?' + query : ''}`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<PurchaseOrder[]>(r));
  },

  getOrder: (barbershopId: string, orderId: string) =>
    apiClient<{ success: boolean; data: PurchaseOrder }>(
      `/api/barbershops/${barbershopId}/purchasing/orders/${orderId}`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<PurchaseOrder>(r)),

  createOrder: (barbershopId: string, data: { supplier: string; expectedDate?: string; notes?: string; items: { name: string; quantity: number; unitPrice: number }[] }) =>
    apiClient<{ success: boolean; data: PurchaseOrder }>(
      `/api/barbershops/${barbershopId}/purchasing/orders`,
      'POST',
      data,
      token()
    ).then(r => unwrap<PurchaseOrder>(r)),

  updateOrder: (barbershopId: string, orderId: string, data: Partial<PurchaseOrder>) =>
    apiClient<{ success: boolean; data: PurchaseOrder }>(
      `/api/barbershops/${barbershopId}/purchasing/orders/${orderId}`,
      'PATCH',
      data,
      token()
    ).then(r => unwrap<PurchaseOrder>(r)),

  addItem: (barbershopId: string, orderId: string, data: { name: string; quantity: number; unitPrice: number }) =>
    apiClient<{ success: boolean; data: PurchaseOrderItem }>(
      `/api/barbershops/${barbershopId}/purchasing/orders/${orderId}/items`,
      'POST',
      data,
      token()
    ).then(r => unwrap<PurchaseOrderItem>(r)),

  removeItem: (barbershopId: string, orderId: string, itemId: string) =>
    apiClient<{ success: boolean }>(
      `/api/barbershops/${barbershopId}/purchasing/orders/${orderId}/items/${itemId}`,
      'DELETE',
      undefined,
      token()
    ),

  receiveItem: (barbershopId: string, orderId: string, itemId: string, data: { quantity: number }) =>
    apiClient<{ success: boolean; data: PurchaseOrderItem }>(
      `/api/barbershops/${barbershopId}/purchasing/orders/${orderId}/items/${itemId}/receive`,
      'POST',
      data,
      token()
    ).then(r => unwrap<PurchaseOrderItem>(r)),

  receiveOrder: (barbershopId: string, orderId: string) =>
    apiClient<{ success: boolean; data: PurchaseOrder }>(
      `/api/barbershops/${barbershopId}/purchasing/orders/${orderId}/receive`,
      'POST',
      undefined,
      token()
    ).then(r => unwrap<PurchaseOrder>(r)),
};
