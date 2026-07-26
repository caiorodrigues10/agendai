import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import { Plan } from './plansApi';
import { Payment } from './paymentsApi';

export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID';
export type PlanBillingCycle = 'MONTHLY' | 'YEARLY';

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  paymentMethod: string | null;
  createdAt: string;
}

export interface PlanEconomics {
  monthlyPlan: { id: string; name: string; price: number; billingCycle: PlanBillingCycle } | null;
  yearlyPlan: { id: string; name: string; price: number; billingCycle: PlanBillingCycle } | null;
  yearlySavingsPerYear: number;
  currentBillingCycle: PlanBillingCycle | null;
  monthsActive: number;
  savedSoFar: number;
  projectedYearlySavings: number;
  missedSavingsSoFar: number;
  missedSavingsPerYear: number;
  platformForegoneRevenueSoFar: number;
  platformForegoneRevenuePerYear: number;
}

export interface Subscription {
  id: string;
  barbershopId: string;
  planId: string;
  planName: string;
  planPrice: number;
  planBillingCycle?: PlanBillingCycle;
  planHasDashboard?: boolean;
  planTierKey?: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string | null;
  cancelDate: string | null;
  createdAt: string;
  trialEndsAt: string;
  daysRemainingInTrial: number | null;
  latestInvoice: Invoice | null;
  /** Presente apenas na resposta de POST /subscriptions (QR PIX, cartão ou checkoutUrl). */
  payment?: Payment;
}

export interface TrialInfo {
  isInTrial: boolean;
  trialEndsAt: string;
  daysRemainingInTrial: number;
  isExpired: boolean;
}

/** Resposta de GET /subscriptions/me — subscription null significa trial (ativo ou expirado). */
export interface MySubscription {
  subscription: Subscription | null;
  trial?: TrialInfo;
  invoices?: Invoice[];
  economics?: PlanEconomics;
  plans?: Plan[];
}

export interface PayerIdentification {
  type: 'CPF' | 'CNPJ';
  number: string;
}

export interface SubscribePayload {
  planId: string;
  paymentMethod: 'pix' | 'credit_card' | 'payment_link';
  cardToken?: string;
  cardPaymentMethodId?: string;
  payerEmail: string;
  payerFirstName?: string;
  payerLastName?: string;
  payerIdentification?: PayerIdentification;
}

function unwrap<T>(res: any): T {
  if (res && typeof res === 'object' && 'data' in res) return res.data as T;
  return res as T;
}

const token = () => authStorage.getAccessToken() || '';

export const subscriptionsApi = {
  me: () =>
    apiClient<any>('/api/subscriptions/me', 'GET', undefined, token()).then(res =>
      unwrap<MySubscription>(res)
    ),
  subscribe: (payload: SubscribePayload) =>
    apiClient<any>('/api/subscriptions', 'POST', payload, token()).then(res =>
      unwrap<Subscription>(res)
    ),
  cancel: () => apiClient<any>('/api/subscriptions/me', 'DELETE', undefined, token())
};

// Compat: `plans` também aparece embutido nos erros 402 (SUBSCRIPTION_REQUIRED)
export type { Plan };
