import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import type { BusinessSegment } from '../types';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export type ProductType = 'RETAIL' | 'CONSUMABLE' | 'BOTH';
export type RetailPaymentMethod = 'cash' | 'pix' | 'credit_card' | 'debit_card' | 'fiado';

export interface Product {
  id: string;
  barbershopId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  imageUrl: string | null;
  unitLabel: string;
  salePrice: number;
  averageCost?: number;
  stockQty: number;
  minStock: number;
  active: boolean;
  type: ProductType;
  trackStock: boolean;
  category?: { id: string; name: string } | null;
}

export interface ProductCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  active: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  whatsapp: string | null;
  email: string | null;
  notes: string | null;
  active: boolean;
}

export interface RetailSaleLine {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitCost?: number;
  refundedQty: number;
}

export interface RetailSale {
  id: string;
  paymentMethod: RetailPaymentMethod;
  subtotal: number;
  discount: number;
  total: number;
  totalCost?: number;
  status: 'COMPLETED' | 'CANCELED' | 'REFUNDED';
  soldAt: string;
  clientId: string | null;
  lines: RetailSaleLine[];
}

export interface RetailSalePayload {
  paymentMethod: RetailPaymentMethod;
  items: { productId: string; quantity: number; unitPrice?: number }[];
  discount?: number;
  clientId?: string;
  idempotencyKey?: string;
}

export const productsApi = {
  listProducts: (params: Record<string, string | number | undefined> = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
    ).toString();
    return apiClient<{ success: boolean; data: Product[] }>(`/api/products${qs ? `?${qs}` : ''}`, 'GET', undefined, token()).then(res => unwrap<Product[]>(res));
  },
  createProduct: (payload: Partial<Product>) =>
    apiClient<{ success: boolean; data: Product }>('/api/products', 'POST', payload, token()).then(res => unwrap<Product>(res)),
  updateProduct: (id: string, payload: Partial<Product>) =>
    apiClient<{ success: boolean; data: Product }>(`/api/products/${id}`, 'PATCH', payload, token()).then(res => unwrap<Product>(res)),
  listCategories: () =>
    apiClient<{ success: boolean; data: ProductCategory[] }>('/api/product-categories', 'GET', undefined, token()).then(res => unwrap<ProductCategory[]>(res)),
  createCategory: (payload: Partial<ProductCategory>) =>
    apiClient<{ success: boolean; data: ProductCategory }>('/api/product-categories', 'POST', payload, token()).then(res => unwrap<ProductCategory>(res)),
  listSuppliers: () =>
    apiClient<{ success: boolean; data: Supplier[] }>('/api/suppliers', 'GET', undefined, token()).then(res => unwrap<Supplier[]>(res)),
  createSupplier: (payload: Partial<Supplier>) =>
    apiClient<{ success: boolean; data: Supplier }>('/api/suppliers', 'POST', payload, token()).then(res => unwrap<Supplier>(res)),
  createReceipt: (payload: {
    supplierId?: string | null;
    supplierName?: string | null;
    paymentMethod?: string | null;
    notes?: string | null;
    createExpense?: boolean;
    skipExpenseReason?: string;
    items: { productId: string; quantity: number; unitCost: number }[];
  }) => apiClient<{ success: boolean; data: unknown }>('/api/inventory/receipts', 'POST', payload, token()).then(res => unwrap(res)),
  adjustStock: (payload: { productId: string; quantity: number; reason: string }) =>
    apiClient<{ success: boolean; data: Product }>('/api/inventory/adjustments', 'POST', payload, token()).then(res => unwrap<Product>(res)),
  listSales: () =>
    apiClient<{ success: boolean; data: RetailSale[] }>('/api/retail-sales', 'GET', undefined, token()).then(res => unwrap<RetailSale[]>(res)),
  createSale: (payload: RetailSalePayload) =>
    apiClient<{ success: boolean; data: RetailSale }>('/api/retail-sales', 'POST', payload, token()).then(res => unwrap<RetailSale>(res)),
  refundSale: (id: string, payload: { reason: string; restock: boolean; refundMethod: string; items: { productId: string; quantity: number }[] }) =>
    apiClient<{ success: boolean; data: RetailSale }>(`/api/retail-sales/${id}/refunds`, 'POST', payload, token()).then(res => unwrap<RetailSale>(res)),
  reports: () =>
    apiClient<{ success: boolean; data: { lowStock: Product[]; inventoryValue: number; byProduct: { name: string; quantity: number; revenue: number; margin: number }[] } }>('/api/products/reports', 'GET', undefined, token()).then(res => unwrap(res)),
  previewTemplate: (barbershopId: string, segment?: BusinessSegment) => {
    const qs = segment ? `?segment=${segment}` : '';
    return apiClient<{ success: boolean; data: unknown }>(`/api/barbershops/${barbershopId}/catalog-template${qs}`, 'GET', undefined, token()).then(res => unwrap(res));
  },
  installTemplate: (barbershopId: string, payload: { segment?: BusinessSegment; include?: Record<string, boolean> } = {}) =>
    apiClient<{ success: boolean; data: { alreadyInstalled: boolean; created: Record<string, number> } }>(
      `/api/barbershops/${barbershopId}/catalog-template/install`,
      'POST',
      payload,
      token()
    ).then(res => unwrap<{ alreadyInstalled: boolean; created: Record<string, number> }>(res)),
};
