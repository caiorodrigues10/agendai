import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function unwrap<T>(res: any): T {
  if (res && typeof res === 'object' && 'data' in res) return res.data as T;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
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
    byType: Array<{ type: string; total: number; count: number }>;
  };
  fiados: {
    activeDebtors: number;
    totalOriginal: number;
    totalPaid: number;
    totalPending: number;
    overdueCount: number;
    overdueAmount: number;
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
}

export interface ExpenseSummary {
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  byCategory: Array<{
    categoryId: string | null;
    categoryName: string | null;
    total: number;
    count: number;
  }>;
  byType: Array<{ type: ExpenseType; total: number; count: number }>;
  byMonth: Array<{ month: string; total: number; count: number }>;
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
  payments?: Array<{
    id: string;
    fiadoId: string;
    amount: number;
    notes: string | null;
    registeredById: string;
    createdAt: string;
  }>;
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
  title: string;
  amount: number;
  type: 'FIXED' | 'VARIABLE';
  referenceDate: string;
  categoryId?: string | null;
  description?: string | null;
  notes?: string | null;
}

export interface CreateFiadoBody {
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
  byWeekday: Array<{ day: string; label: string; volume: number; revenue: number }>;
  byHour: Array<{ hour: number; label: string; volume: number }>;
  topServices: Array<{
    serviceId: string;
    name: string;
    count: number;
    revenue: number;
  }>;
  byStaff: Array<{
    staffId: string;
    name: string;
    count: number;
    revenue: number;
  }>;
  appointments: {
    total: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  inactiveCustomers: Array<{
    whatsapp: string;
    customerName: string;
    lastVisitAt: string;
    daysSince: number;
    visits: number;
  }>;
  highlights: string[];
}

const buildQuery = (params?: Record<string, string | number | undefined>) => {
  const qs = new URLSearchParams();
  if (!params) return '';
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') qs.set(key, String(value));
  });
  const str = qs.toString();
  return str ? `?${str}` : '';
};

export const financialApi = {
  getInsights: (period: InsightsPeriod = '30d') =>
    apiClient<{ success: boolean; data: BarbershopInsights }>(
      `/api/barbershop/insights${buildQuery({ period })}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<BarbershopInsights>(res)),

  getSummary: (params?: { from?: string; to?: string }) =>
    apiClient<{ success: boolean; data: FinancialSummary }>(
      `/api/barbershop/financial/summary${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<FinancialSummary>(res)),

  listExpenses: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient<{ success: boolean; data: ExpenseItem[]; meta: ListMeta }>(
      `/api/expenses${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    ).then(res => ({
      data: unwrap<ExpenseItem[]>(res),
      meta: (res as any).meta as ListMeta
    })),

  createExpense: (body: CreateExpenseBody) =>
    apiClient<{ success: boolean; data: ExpenseItem }>(
      '/api/expenses',
      'POST',
      body,
      token()
    ).then(res => unwrap<ExpenseItem>(res)),

  deleteExpense: (id: string) =>
    apiClient<void>(`/api/expenses/${id}`, 'DELETE', undefined, token()),

  getExpenseSummary: () =>
    apiClient<{ success: boolean; data: ExpenseSummary }>(
      '/api/expenses/summary',
      'GET',
      undefined,
      token()
    ).then(res => unwrap<ExpenseSummary>(res)),

  listFiados: (params?: { page?: number; status?: string; search?: string }) =>
    apiClient<{ success: boolean; data: FiadoItem[]; meta: ListMeta }>(
      `/api/fiado${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    ).then(res => ({
      data: unwrap<FiadoItem[]>(res),
      meta: (res as any).meta as ListMeta
    })),

  createFiado: (body: CreateFiadoBody) =>
    apiClient<{ success: boolean; data: FiadoItem }>(
      '/api/fiado',
      'POST',
      body,
      token()
    ).then(res => unwrap<FiadoItem>(res)),

  addFiadoPayment: (id: string, body: { amount: number; notes?: string }) =>
    apiClient<{ success: boolean; data: unknown }>(
      `/api/fiado/${id}/payments`,
      'POST',
      body,
      token()
    ).then(res => unwrap(res)),

  deleteFiado: (id: string) =>
    apiClient<void>(`/api/fiado/${id}`, 'DELETE', undefined, token()),

  listExpenseCategories: () =>
    apiClient<{ success: boolean; data: ExpenseCategory[] }>(
      '/api/expense-categories',
      'GET',
      undefined,
      token()
    ).then(res => unwrap<ExpenseCategory[]>(res))
};
