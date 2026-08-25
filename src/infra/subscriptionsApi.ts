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
  hasPaymentMethod?: boolean;
  cardLast4?: string | null;
  cardBrand?: string | null;
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

/**
 * Resposta de GET /subscriptions/me.
 * `trial` vem sempre (mesmo com assinatura): 30 dias de Pro desde o cadastro.
 * Se assinar Essencial no meio do trial, o Pro continua até trialEndsAt.
 */
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

export interface CancellationContext {
  hasUsage: boolean;
  usageDays: number;
  appointmentsTotal: number;
  appointmentsCompleted: number;
  queueCompleted: number;
  postsPublished: number;
  revenue: number;
  uniqueCustomers: number;
  savingsSoFar: number;
  yearlySavingsPerYear: number;
  currentBillingCycle: 'MONTHLY' | 'YEARLY' | null;
  planName: string | null;
  proratedRefundAvailable: boolean;
  refundProvider: 'ABACATEPAY' | 'MERCADOPAGO' | 'ASAAS' | null;
}

export interface SubscribePayload {
  planId: string;
  paymentMethod: 'pix' | 'credit_card' | 'payment_link' | 'asaas';
  /** Meio de pagamento embutido do Asaas (PIX por padrão). */
  asaasBillingType?: 'PIX' | 'CREDIT_CARD';
  cardToken?: string;
  cardPaymentMethodId?: string;
  /** Cartão Asaas processado no backend (createPayment). */
  asaasCreditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
  payerEmail: string;
  payerFirstName?: string;
  payerLastName?: string;
  payerIdentification?: PayerIdentification;
}

export interface SetupTrialCardPayload {
  planId: string;
  payerEmail: string;
  payerFirstName?: string;
  payerLastName?: string;
  payerIdentification: PayerIdentification;
  asaasCreditCard: NonNullable<SubscribePayload['asaasCreditCard']>;
}

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

interface CancelResponse {
  proratedRefund?: {
    status: 'SUCCEEDED' | 'PENDING' | 'FAILED';
    amount: number;
  };
}

const token = () => authStorage.getAccessToken() || '';

export const subscriptionsApi = {
  me: () =>
    apiClient<{ success: boolean; data: MySubscription }>('/api/subscriptions/me', 'GET', undefined, token()).then(res =>
      unwrap<MySubscription>(res)
    ),
  subscribe: (payload: SubscribePayload) =>
    apiClient<{ success: boolean; data: Subscription }>('/api/subscriptions', 'POST', payload, token()).then(res =>
      unwrap<Subscription>(res)
    ),
  setupTrialCard: (payload: SetupTrialCardPayload) =>
    apiClient<{ success: boolean; data: Subscription }>('/api/subscriptions/setup-trial-card', 'POST', payload, token()).then(res =>
      unwrap<Subscription>(res)
    ),
  cancel: (payload?: { cancelReason?: string; pixKey?: string; pixKeyType?: string }) =>
    apiClient<CancelResponse>(
      '/api/subscriptions/me',
      'DELETE',
      payload?.cancelReason || payload?.pixKey
        ? {
            cancelReason: payload.cancelReason,
            pixKey: payload.pixKey,
            pixKeyType: payload.pixKeyType,
          }
        : undefined,
      token()
    ),
  getCancellationContext: () =>
    apiClient<{ success: boolean; data: CancellationContext }>('/api/subscriptions/cancellation-context', 'GET', undefined, token()).then(res =>
      unwrap<CancellationContext>(res)
    )
};

// Compat: `plans` também aparece embutido nos erros 402 (SUBSCRIPTION_REQUIRED)
export type { Plan };
