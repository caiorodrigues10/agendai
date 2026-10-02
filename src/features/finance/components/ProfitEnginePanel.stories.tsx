import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { ProfitEnginePanel } from './ProfitEnginePanel';

const settings = {
  id: 'ps-1',
  barbershopId: 'shop-1',
  defaultTaxRate: 6,
  defaultCommission: 30,
  overheadCategories: { aluguel: 3200, folha: 5400 },
  createdAt: '2026-01-10T12:00:00.000Z',
  updatedAt: '2026-09-20T12:00:00.000Z',
};

const entry = {
  id: 'pe-1',
  barbershopId: 'shop-1',
  period: '2026-10',
  serviceId: 'svc-1',
  staffId: 'st-1',
  revenue: 12400,
  directCosts: 900,
  overheadCosts: 1600,
  taxAmount: 744,
  commissionAmt: 3720,
  netProfit: 5436,
  marginPercent: 43.8,
  computedAt: '2026-10-01T03:00:00.000Z',
  service: { id: 'svc-1', name: 'Corte + Barba' },
  staff: { id: 'st-1', name: 'Ana Souza' },
};

const periodData = {
  period: '2026-10',
  entries: [entry],
  totals: {
    revenue: 12400,
    directCosts: 900,
    overheadCosts: 4800,
    taxAmount: 744,
    commissionAmt: 3720,
    netProfit: 2236,
    marginPercent: 18,
  },
};

const trend = [
  { period: '2026-05', revenue: 9800, netProfit: 1400, marginPercent: 14.3 },
  { period: '2026-06', revenue: 10500, netProfit: 1700, marginPercent: 16.2 },
  { period: '2026-07', revenue: 11200, netProfit: 1900, marginPercent: 17 },
  { period: '2026-08', revenue: 11800, netProfit: 2100, marginPercent: 17.8 },
  { period: '2026-09', revenue: 12100, netProfit: 2200, marginPercent: 18.2 },
  { period: '2026-10', revenue: 12400, netProfit: 2236, marginPercent: 18 },
];

const json = (data: unknown) => HttpResponse.json({ success: true, data });

const mswHandler = (overrides: {
  period?: unknown;
  entries?: unknown[];
  trend?: unknown[];
} = {}) => [
  http.get('/api/barbershops/:id/profit/settings', () => json(settings)),
  http.get('/api/barbershops/:id/profit/period/:period', () =>
    json({
      ...periodData,
      entries: overrides.entries ?? periodData.entries,
      totals:
        overrides.entries && overrides.entries.length === 0
          ? { ...periodData.totals, revenue: 0, directCosts: 0, taxAmount: 0, commissionAmt: 0, netProfit: 0, marginPercent: 0 }
          : periodData.totals,
    })
  ),
  http.get('/api/barbershops/:id/profit/trend', () => json(overrides.trend ?? trend)),
  http.get('/api/barbershops/:id/profit/by-service', () =>
    json(overrides.entries ?? periodData.entries)
  ),
  http.get('/api/barbershops/:id/profit/by-staff', () =>
    json(overrides.entries ?? periodData.entries)
  ),
];

const meta = {
  title: 'Financeiro/ProfitEnginePanel',
  component: ProfitEnginePanel,
  tags: ['autodocs', 'test'],
  parameters: {
    layout: 'centered',
    msw: { handlers: mswHandler() },
  },
  args: {
    barbershopId: 'shop-1',
  },
} satisfies Meta<typeof ProfitEnginePanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SemMovimentos: Story = {
  parameters: { msw: { handlers: mswHandler({ entries: [], trend: [] }) } },
};

export const Erro: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/barbershops/:id/profit/settings', () => json(settings)),
        http.get('/api/barbershops/:id/profit/period/:period', () =>
          HttpResponse.json({ success: false, message: 'Erro ao carregar' }, { status: 500 })
        ),
        http.get('/api/barbershops/:id/profit/trend', () => json([])),
        http.get('/api/barbershops/:id/profit/by-service', () => json([])),
        http.get('/api/barbershops/:id/profit/by-staff', () => json([])),
      ],
    },
  },
};
