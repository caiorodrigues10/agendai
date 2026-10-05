import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useEffect } from 'react';
import { http, HttpResponse } from 'msw';
import { within } from 'storybook/test';
import { SubscriptionsSection } from './SubscriptionsSection';
import type { SubscriptionListItem, SubscriptionEconomics } from '../../infra/adminApi';
import { authStorage } from '../../infra/authStorage';

const subscriptions: SubscriptionListItem[] = [
  {
    id: 'sub-1',
    barbershopId: 'shop-101',
    barbershopName: 'Barbearia Central',
    planId: 'plan-pro',
    planName: 'Pro',
    planPrice: 119.9,
    planBillingCycle: 'MONTHLY',
    status: 'ACTIVE',
    startDate: '2026-01-15T12:00:00.000Z',
    endDate: null,
    cancelDate: null,
    trialEndsAt: '2026-01-25T12:00:00.000Z',
    latestInvoice: null,
  },
  {
    id: 'sub-2',
    barbershopId: 'shop-102',
    barbershopName: 'Navalha Real',
    planId: 'plan-essencial',
    planName: 'Essencial',
    planPrice: 59.9,
    planBillingCycle: 'YEARLY',
    status: 'TRIALING',
    startDate: '2026-09-20T12:00:00.000Z',
    endDate: null,
    cancelDate: null,
    trialEndsAt: '2026-10-04T12:00:00.000Z',
    latestInvoice: null,
  },
  {
    id: 'sub-3',
    barbershopId: 'shop-103',
    barbershopName: 'Barba Brava',
    planId: 'plan-pro',
    planName: 'Pro',
    planPrice: 119.9,
    planBillingCycle: 'MONTHLY',
    status: 'CANCELED',
    startDate: '2025-11-01T12:00:00.000Z',
    endDate: '2026-09-01T12:00:00.000Z',
    cancelDate: '2026-09-01T12:00:00.000Z',
    cancelReason: 'price',
    trialEndsAt: '2025-11-11T12:00:00.000Z',
    latestInvoice: null,
  },
];

const economics: SubscriptionEconomics = {
  yearlySavingsPerYear: 239.8,
  activeYearlySubscriptions: 4,
  activeMonthlySubscriptions: 27,
  totalTenantSavingsSoFar: 3120.5,
  totalPlatformForegoneSoFar: 1840.2,
  projectedAnnualDiscount: 960.4,
  monthlyPlanPrice: 119.9,
  yearlyPlanPrice: 958.8,
};

const zeroEconomics: SubscriptionEconomics = {
  yearlySavingsPerYear: 0,
  activeYearlySubscriptions: 0,
  activeMonthlySubscriptions: 0,
  totalTenantSavingsSoFar: 0,
  totalPlatformForegoneSoFar: 0,
  projectedAnnualDiscount: 0,
  monthlyPlanPrice: null,
  yearlyPlanPrice: null,
};

type ListMode = 'ok' | 'empty' | 'error';

const mswHandlers = (mode: ListMode = 'ok') => [
  http.get('/api/admin/subscriptions/economics', () =>
    HttpResponse.json({
      success: true,
      data: mode === 'empty' ? zeroEconomics : economics,
    })
  ),
  http.get('/api/admin/subscriptions', () =>
    mode === 'error'
      ? HttpResponse.json({ message: 'Falha ao carregar assinaturas.' }, { status: 500 })
      : HttpResponse.json({
          success: true,
          data: mode === 'empty' ? [] : subscriptions,
          meta:
            mode === 'empty'
              ? { total: 0, page: 1, limit: 10, totalPages: 1 }
              : { total: subscriptions.length, page: 1, limit: 10, totalPages: 1 },
        })
  ),
];

/**
 * `adminApi.getAuthHeader()` lança "Não autenticado" sem access token —
 * semeia um token barato antes do fetch e limpa ao desmontar (o test-runner
 * usa um único contexto do Playwright; storage vaza entre stories).
 */
const StoryFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => () => authStorage.clearTokens(), []);
  return <>{children}</>;
};

const meta = {
  title: 'Billing/SubscriptionsSection',
  component: SubscriptionsSection,
  tags: ['autodocs', 'test'],
  decorators: [
    Story => {
      authStorage.setAccessToken('story-access-token', false);
      return (
        <StoryFrame>
          <Story />
        </StoryFrame>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers('ok') },
  },
} satisfies Meta<typeof SubscriptionsSection>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Barbearia Central', {}, { timeout: 10000 });
    await canvas.findByText('Mix ativo', {}, { timeout: 10000 });
  },
};

export const Erro: Story = {
  parameters: { msw: { handlers: mswHandlers('error') } },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Falha ao carregar assinaturas.', {}, { timeout: 10000 });
  },
};

export const Vazio: Story = {
  parameters: { msw: { handlers: mswHandlers('empty') } },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(
      'Nenhuma assinatura encontrada.',
      {},
      { timeout: 10000 }
    );
  },
};
