import { expenseCategoriesApi } from './categoriesApi';
import { apiClient, apiFetch } from './apiClient';
import { authStorage } from './authStorage';
import type { ShopWeatherDay } from './barbershopApi';
import { buildQuery } from '../utils/query';
import { getSelectedBarbershopId } from './selectedShopStore';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

function resolveBarbershopId(): string | undefined {
  const user = authStorage.getUser();
  if (user?.role === 'MASTER_ADMIN') {
    return getSelectedBarbershopId() ?? undefined;
  }
  return undefined;
}

function withShopBody<T extends object>(body: T): T & { barbershopId?: string } {
  const barbershopId = resolveBarbershopId();
  return barbershopId ? { ...body, barbershopId } : body;
}

export type ExpenseType = 'FIXED' | 'VARIABLE' | 'INVESTMENT';
export type FiadoStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'FORGIVEN';

export interface ListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FinancialSummary {
  expenses: {
    total: number;
    totalPaid: number;
    totalPending: number;
    count: number;
    byType: { type: string; total: number; count: number }[];
  };
  fiados: {
    activeDebtors: number;
    totalOriginal: number;
    totalPaid: number;
    totalPending: number;
    overdueCount: number;
    overdueAmount: number;
  };
  packages?: {
    count: number;
    totalPaid: number;
  };
  products?: {
    revenue: number;
    netRevenue?: number;
    refunded: number;
    cogs: number;
    margin: number;
    saleCount: number;
    inventoryValue: number;
    lowStockCount: number;
    stockPurchases: number;
  };
}

export interface ExpenseItem {
  id: string;
  barbershopId: string;
  categoryId: string | null;
  categoryName: string | null;
  title: string;
  description: string | null;
  amount: number;
  type: ExpenseType;
  recurrence: string;
  referenceDate: string;
  paidAt: string | null;
  dueDate: string | null;
  paymentMethod: string | null;
  supplierName: string | null;
  receiptUrl: string | null;
  notes: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  locked?: boolean;
  inventoryReceiptId?: string | null;
}

export interface ExpenseSummary {
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  byCategory: {
    categoryId: string | null;
    categoryName: string | null;
    total: number;
    count: number;
  }[];
  byType: { type: ExpenseType; total: number; count: number }[];
  byMonth: { month: string; total: number; count: number }[];
}

export interface FiadoItem {
  id: string;
  barbershopId: string;
  customerName: string;
  whatsapp: string;
  description: string;
  originalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: FiadoStatus;
  dueDate: string | null;
  notes: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
  payments?: {
    id: string;
    fiadoId: string;
    amount: number;
    notes: string | null;
    registeredById: string;
    createdAt: string;
  }[];
}

export interface ExpenseCategory {
  id: string;
  barbershopId: string | null;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseBody {
  barbershopId?: string;
  title: string;
  amount: number;
  type: ExpenseType;
  referenceDate: string;
  categoryId?: string | null;
  description?: string | null;
  notes?: string | null;
  recurrence?: string;
  dueDate?: string | null;
  paymentMethod?: string | null;
  supplierName?: string | null;
}

export interface FiadoPayment {
  id: string;
  fiadoId: string;
  amount: number;
  notes: string | null;
  registeredById: string;
  createdAt: string;
}

export interface CreateFiadoBody {
  barbershopId?: string;
  customerName: string;
  whatsapp: string;
  description: string;
  amount: number;
  dueDate?: string | null;
  notes?: string | null;
}

export type InsightsPeriod = '7d' | '30d' | '90d';

export interface BarbershopInsights {
  period: InsightsPeriod;
  from: string;
  to: string;
  kpis: {
    revenue: number;
    completedServices: number;
    avgTicket: number;
    avgWaitMinutes: number | null;
    queueCancelRate: number;
    appointmentCancelRate: number;
    returningCustomerRate: number;
    uniqueCustomers: number;
    expenses: number;
    netProfit: number;
    openFiado: number;
    overdueFiado: number;
  };
  byWeekday: { day: string; label: string; volume: number; revenue: number }[];
  byHour: { hour: number; label: string; volume: number }[];
  topServices: {
    serviceId: string;
    name: string;
    count: number;
    revenue: number;
  }[];
  byStaff: {
    staffId: string;
    name: string;
    count: number;
    revenue: number;
  }[];
  appointments: {
    total: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  inactiveCustomers: {
    whatsapp: string;
    customerName: string;
    lastVisitAt: string;
    daysSince: number;
    visits: number;
  }[];
  highlights: string[];
}

export interface WeatherDemandPrediction {
  date: string;
  condition: string;
  predictedQueue: number;
  confidenceLow: number;
  confidenceHigh: number;
  baselineAvg: number;
  dropPct: number;
  topFactors: { feature: string; impact: number }[];
  recommendation: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface WeatherInsights {
  barbershopName: string;
  location: { lat: number; lng: number };
  historicalDays: number;
  modelTrained: boolean;
  predictions: WeatherDemandPrediction[];
  forecast?: ShopWeatherDay[];
  summary: {
    avgDropPct: number;
    highRiskCount: number;
    bestDay: WeatherDemandPrediction | null;
    worstDay: WeatherDemandPrediction | null;
  };
  highlights: string[];
}

export const financialApi = {
  getInsights: (period: InsightsPeriod = '30d') =>
    apiClient<{ success: boolean; data: BarbershopInsights }>(
      `/api/barbershop/insights${buildQuery({ period, barbershopId: resolveBarbershopId() })}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<BarbershopInsights>(res)),

  getSummary: (params?: { from?: string; to?: string }) =>
    apiClient<{ success: boolean; data: FinancialSummary }>(
      `/api/barbershop/financial/summary${buildQuery({ ...params, barbershopId: resolveBarbershopId() })}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<FinancialSummary>(res)),

  listExpenses: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    type?: ExpenseType;
    paid?: string;
    from?: string;
    to?: string;
  }) =>
    apiClient<{ success: boolean; data: ExpenseItem[]; meta: ListMeta }>(
      `/api/expenses${buildQuery({ ...params, barbershopId: resolveBarbershopId() })}`,
      'GET',
      undefined,
      token()
    ).then(res => ({
      data: unwrap<ExpenseItem[]>(res),
      meta: res.meta,
    })),

  createExpense: (body: CreateExpenseBody) =>
    apiClient<{ success: boolean; data: ExpenseItem }>('/api/expenses', 'POST', withShopBody(body), token()).then(
      res => unwrap<ExpenseItem>(res)
    ),

  updateExpense: (id: string, body: Partial<CreateExpenseBody>) =>
    apiClient<{ success: boolean; data: ExpenseItem }>(
      `/api/expenses/${id}`,
      'PATCH',
      body,
      token()
    ).then(res => unwrap<ExpenseItem>(res)),

  deleteExpense: (id: string) =>
    apiClient<void>(`/api/expenses/${id}`, 'DELETE', undefined, token()),

  exportExpensesCsv: async (params?: Record<string, string | undefined>) => {
    const all: ExpenseItem[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const query = buildQuery({ ...params, page: String(page), limit: '100', barbershopId: resolveBarbershopId() });
      const response = await apiFetch(`/api/expenses${query}`, {}, token());
      if (!response.ok) throw new Error(`Falha ao exportar despesas (${response.status})`);
      const data = await response.json();
      const items: ExpenseItem[] = data.data ?? data;
      all.push(...items);
      totalPages = data.meta?.totalPages ?? 1;
      page += 1;
    } while (page <= totalPages && page <= 50);

    const header =
      'Data ref.,Título,Tipo,Recorrência,Valor,Pago em,Fornecedor,Categoria,Forma pgto\n';
    const rows = all
      .map((e: ExpenseItem) =>
        [
          e.referenceDate?.slice(0, 10) ?? '',
          `"${(e.title ?? '').replace(/"/g, '""')}"`,
          e.type,
          e.recurrence,
          e.amount,
          e.paidAt?.slice(0, 10) ?? '',
          `"${(e.supplierName ?? '').replace(/"/g, '""')}"`,
          `"${(e.categoryName ?? '').replace(/"/g, '""')}"`,
          e.paymentMethod ?? '',
        ].join(',')
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `despesas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  getExpenseSummary: (params?: { from?: string; to?: string }) =>
    apiClient<{ success: boolean; data: ExpenseSummary }>(
      `/api/expenses/summary${buildQuery({ ...params, barbershopId: resolveBarbershopId() })}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<ExpenseSummary>(res)),

  listFiados: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    apiClient<{ success: boolean; data: FiadoItem[]; meta: ListMeta }>(
      `/api/fiado${buildQuery({ ...params, barbershopId: resolveBarbershopId() })}`,
      'GET',
      undefined,
      token()
    ).then(res => ({
      data: unwrap<FiadoItem[]>(res),
      meta: res.meta,
    })),

  createFiado: (body: CreateFiadoBody) =>
    apiClient<{ success: boolean; data: FiadoItem }>('/api/fiado', 'POST', withShopBody(body), token()).then(
      res => unwrap<FiadoItem>(res)
    ),

  addFiadoPayment: (id: string, body: { amount: number; notes?: string }) =>
    apiClient<{ success: boolean; data: FiadoPayment }>(
      `/api/fiado/${id}/payments`,
      'POST',
      withShopBody(body),
      token()
    ).then(res => unwrap<FiadoPayment>(res)),

  chargeFiado: (id: string, body: { pixKey?: string; cardPaymentLink?: string }) =>
    apiClient<{ success: boolean; message: string }>(
      `/api/fiado/${id}/charge`,
      'POST',
      body,
      token()
    ),

  deleteFiado: (id: string) => apiClient<void>(`/api/fiado/${id}`, 'DELETE', undefined, token()),

  listExpenseCategories: expenseCategoriesApi.list,
  createExpenseCategory: expenseCategoriesApi.create,
  updateExpenseCategory: expenseCategoriesApi.update,
  deleteExpenseCategory: expenseCategoriesApi.delete,

  getWeatherInsights: (days = 7) =>
    apiClient<{ success: boolean; data: WeatherInsights }>(
      `/api/barbershop/weather-insights${buildQuery({ days, barbershopId: resolveBarbershopId() })}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<WeatherInsights>(res)),
};
