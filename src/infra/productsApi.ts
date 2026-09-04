import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import type { BusinessSegment } from '../types';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function metaOf(res: unknown): ListMeta {
  const m = (res as { meta?: ListMeta }).meta;
  return m ?? { total: 0, page: 1, limit: 30 };
}

function token() {
  return authStorage.getAccessToken() || '';
}

function buildQuery(params?: Record<string, string | number | undefined>) {
  const qs = new URLSearchParams();
  if (!params) return '';
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') qs.set(key, String(value));
  });
  const str = qs.toString();
  return str ? `?${str}` : '';
}

export type ProductType = 'RETAIL' | 'CONSUMABLE' | 'BOTH';
export type RetailPaymentMethod = 'cash' | 'pix' | 'credit_card' | 'debit_card' | 'fiado';
export type StockMovementType = 'PURCHASE_RECEIPT' | 'SALE' | 'SALE_REFUND' | 'INTERNAL_CONSUMPTION' | 'MANUAL_ADJUSTMENT' | 'PURCHASE_REVERSAL';

export interface ListMeta {
  total: number;
  page: number;
  limit: number;
}

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

export interface StockMovement {
  id: string;
  type: StockMovementType;
  quantity: number;
  unitCost: number;
  stockBefore: number;
  stockAfter: number;
  reason: string | null;
  createdAt: string;
  product?: { name: string };
}

export interface InventoryReceiptItem {
  id: string;
  productId: string;
  quantity: number;
  unitCost: number;
  product?: { id: string; name: string };
}

export interface InventoryReceipt {
  id: string;
  supplierId: string | null;
  supplierName: string | null;
  receivedAt: string;
  total: number;
  notes: string | null;
  reversedAt: string | null;
  supplier?: { id: string; name: string } | null;
  items: InventoryReceiptItem[];
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
  refunds?: { id: string; reason: string; financialRefund: number; createdAt: string }[];
}

export interface RetailSalePayload {
  paymentMethod: RetailPaymentMethod;
  items: { productId: string; quantity: number; unitPrice?: number }[];
  discount?: number;
  clientId?: string;
  idempotencyKey?: string;
}

export interface CatalogTemplatePreviewItem {
  name: string;
  alreadyExists?: boolean;
  description?: string;
  salePrice?: number;
  unitLabel?: string;
  type?: ProductType;
  categoryName?: string;
  price?: number;
  avgTimeMinutes?: number;
  icon?: string;
  color?: string;
}

export interface CatalogTemplatePreview {
  segment: BusinessSegment;
  version: string;
  alreadyInstalled: boolean;
  serviceCategories: CatalogTemplatePreviewItem[];
  productCategories: CatalogTemplatePreviewItem[];
  expenseCategories: CatalogTemplatePreviewItem[];
  services: CatalogTemplatePreviewItem[];
  products: CatalogTemplatePreviewItem[];
  posts?: unknown[];
}

export interface ProductReports {
  byProduct: { productId: string; name: string; quantity: number; revenue: number; cost: number; margin: number }[];
  lowStock: Product[];
  idleProducts: { id: string; name: string; stockQty: number }[];
  inventoryValue: number;
  byStaff: { soldById: string; soldByName: string; total: number; count: number }[];
}

export const productsApi = {
  listProducts: async (params: Record<string, string | number | undefined> = {}) => {
    const res = await apiClient<{ success: boolean; data: Product[]; meta?: ListMeta }>(
      `/api/products${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    );
    return { data: unwrap<Product[]>(res), meta: metaOf(res) };
  },
  createProduct: (payload: Partial<Product>) =>
    apiClient<{ success: boolean; data: Product }>('/api/products', 'POST', payload, token()).then(res => unwrap<Product>(res)),
  updateProduct: (id: string, payload: Partial<Product>) =>
    apiClient<{ success: boolean; data: Product }>(`/api/products/${id}`, 'PATCH', payload, token()).then(res => unwrap<Product>(res)),
  listCategories: () =>
    apiClient<{ success: boolean; data: ProductCategory[] }>('/api/product-categories', 'GET', undefined, token()).then(res => unwrap<ProductCategory[]>(res)),
  createCategory: (payload: Partial<ProductCategory>) =>
    apiClient<{ success: boolean; data: ProductCategory }>('/api/product-categories', 'POST', payload, token()).then(res => unwrap<ProductCategory>(res)),
  updateCategory: (id: string, payload: Partial<ProductCategory>) =>
    apiClient<{ success: boolean; data: ProductCategory }>(`/api/product-categories/${id}`, 'PATCH', payload, token()).then(res => unwrap<ProductCategory>(res)),
  listSuppliers: () =>
    apiClient<{ success: boolean; data: Supplier[] }>('/api/suppliers', 'GET', undefined, token()).then(res => unwrap<Supplier[]>(res)),
  createSupplier: (payload: Partial<Supplier>) =>
    apiClient<{ success: boolean; data: Supplier }>('/api/suppliers', 'POST', payload, token()).then(res => unwrap<Supplier>(res)),
  updateSupplier: (id: string, payload: Partial<Supplier>) =>
    apiClient<{ success: boolean; data: Supplier }>(`/api/suppliers/${id}`, 'PATCH', payload, token()).then(res => unwrap<Supplier>(res)),
  listMovements: async (params: { page?: number; limit?: number } = {}) => {
    const res = await apiClient<{ success: boolean; data: StockMovement[]; meta?: ListMeta }>(
      `/api/inventory/movements${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    );
    return { data: unwrap<StockMovement[]>(res), meta: metaOf(res) };
  },
  listReceipts: async (params: { page?: number; limit?: number } = {}) => {
    const res = await apiClient<{ success: boolean; data: InventoryReceipt[]; meta?: ListMeta }>(
      `/api/inventory/receipts${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    );
    return { data: unwrap<InventoryReceipt[]>(res), meta: metaOf(res) };
  },
  createReceipt: (payload: {
    supplierId?: string | null;
    supplierName?: string | null;
    paymentMethod?: string | null;
    notes?: string | null;
    createExpense?: boolean;
    skipExpenseReason?: string;
    items: { productId: string; quantity: number; unitCost: number }[];
  }) => apiClient<{ success: boolean; data: unknown }>('/api/inventory/receipts', 'POST', payload, token()).then(res => unwrap(res)),
  reverseReceipt: (id: string, payload: { reason: string }) =>
    apiClient<{ success: boolean; data: unknown }>(`/api/inventory/receipts/${id}/reverse`, 'POST', payload, token()).then(res => unwrap(res)),
  adjustStock: (payload: { productId: string; quantity: number; reason: string; type?: 'MANUAL_ADJUSTMENT' | 'INTERNAL_CONSUMPTION' }) =>
    apiClient<{ success: boolean; data: Product }>('/api/inventory/adjustments', 'POST', payload, token()).then(res => unwrap<Product>(res)),
  listSales: async (params: { page?: number; limit?: number } = {}) => {
    const res = await apiClient<{ success: boolean; data: RetailSale[]; meta?: ListMeta }>(
      `/api/retail-sales${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    );
    return { data: unwrap<RetailSale[]>(res), meta: metaOf(res) };
  },
  getSale: (id: string) =>
    apiClient<{ success: boolean; data: RetailSale }>(`/api/retail-sales/${id}`, 'GET', undefined, token()).then(res => unwrap<RetailSale>(res)),
  createSale: (payload: RetailSalePayload) =>
    apiClient<{ success: boolean; data: RetailSale }>('/api/retail-sales', 'POST', payload, token()).then(res => unwrap<RetailSale>(res)),
  refundSale: (id: string, payload: { reason: string; restock: boolean; refundMethod: string; items: { productId: string; quantity: number }[] }) =>
    apiClient<{ success: boolean; data: RetailSale }>(`/api/retail-sales/${id}/refunds`, 'POST', payload, token()).then(res => unwrap<RetailSale>(res)),
  reports: (from?: string, to?: string) =>
    apiClient<{ success: boolean; data: ProductReports }>(
      `/api/products/reports${buildQuery({ from, to })}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<ProductReports>(res)),
  previewTemplate: (barbershopId: string, segment?: BusinessSegment) => {
    const qs = segment ? `?segment=${segment}` : '';
    return apiClient<{ success: boolean; data: CatalogTemplatePreview }>(
      `/api/barbershops/${barbershopId}/catalog-template${qs}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<CatalogTemplatePreview>(res));
  },
  installTemplate: (barbershopId: string, payload: { segment?: BusinessSegment; include?: Record<string, boolean> } = {}) =>
    apiClient<{ success: boolean; data: { alreadyInstalled: boolean; created: Record<string, number> } }>(
      `/api/barbershops/${barbershopId}/catalog-template/install`,
      'POST',
      payload,
      token()
    ).then(res => unwrap<{ alreadyInstalled: boolean; created: Record<string, number> }>(res)),
};
