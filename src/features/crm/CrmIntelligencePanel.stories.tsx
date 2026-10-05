import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { userEvent, within } from 'storybook/test';
import { CrmIntelligencePanel } from './CrmIntelligencePanel';
import type { CrmOverview } from '../../infra/crmApi';

const json = (data: unknown) => HttpResponse.json({ success: true, data });

const overview: CrmOverview = {
  from: '2026-09-01',
  to: '2026-10-01',
  compare: { grossRevenue: 12000, receivedRevenue: 11000, customers: 80 },
  kpis: {
    grossRevenue: 15000,
    receivedRevenue: 14000,
    outstanding: 2500,
    avgTicket: 75,
    recurringCustomers: 40,
    revenueAtRisk: 900,
    noShows: 12,
    attendanceRate: 87,
  },
  byDay: [
    { date: '2026-09-28', grossRevenue: 800, receivedRevenue: 750, visits: 12 },
    { date: '2026-09-29', grossRevenue: 1100, receivedRevenue: 1000, visits: 15 },
    { date: '2026-09-30', grossRevenue: 950, receivedRevenue: 900, visits: 13 },
  ],
  byService: [{ id: 'svc-1', name: 'Corte', revenue: 6000, visits: 70 }],
  byCategory: [{ id: 'cat-1', name: 'Cabelo', revenue: 9000, visits: 100 }],
  byProfessional: [{ id: 'st-1', name: 'Ana Souza', revenue: 8000, visits: 90 }],
  topClients: [
    {
      clientId: 'cli-1',
      name: 'Bruno Alves',
      whatsapp: '5511999990001',
      ltv: 1200,
      grossRevenue: 1300,
      receivedRevenue: 1200,
      outstanding: 100,
      visits: 14,
      avgTicket: 86,
      lastVisitAt: '2026-09-25T10:00:00.000Z',
      daysSinceLastVisit: 6,
      risk: 'low',
      segment: 'recurring',
      favoriteService: 'Corte',
      activePackageSessions: 2,
      marketingOptIn: true,
    },
  ],
  segments: [
    { segment: 'recurring', label: 'Recorrentes', count: 40, potential: 2000 },
    { segment: 'at_risk', label: 'Em risco', count: 12, potential: 800 },
  ],
};

const overviewOk = http.get('/api/crm/overview', () => json(overview));

const mswHandlers = [overviewOk];

const meta = {
  title: 'CRM/CrmIntelligencePanel',
  component: CrmIntelligencePanel,
  tags: ['autodocs', 'test'],
  args: {
    canAnalytics: true,
    canCampaigns: true,
    period: { from: '2026-09-01', to: '2026-10-01' },
    onPeriodChange: () => undefined,
    onOpenClient: () => undefined,
    onNotify: () => undefined,
  },
  decorators: [
    Story => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers },
  },
} satisfies Meta<typeof CrmIntelligencePanel>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Espera o resumo carregado (gráfico por dia) antes do capture. */
const waitForOverview = async (canvas: ReturnType<typeof within>) => {
  await canvas.findByText('Receita e recebimento por dia', {}, { timeout: 10000 });
};

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await waitForOverview(within(canvasElement));
  },
};

/** Falha do resumo (GET /api/crm/overview → 500): banner na aba Resumo. */
export const ErroResumo: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/crm/overview', () =>
          HttpResponse.json(
            { success: false, message: 'Não foi possível carregar o resumo do CRM.' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(
      'Não foi possível carregar o resumo do CRM.',
      {},
      { timeout: 10000 }
    );
  },
};

/** Falha da lista (GET /api/crm/clients → 500): banner na aba Segmentos. */
export const ErroClientes: Story = {
  parameters: {
    msw: {
      handlers: [
        overviewOk,
        http.get('/api/crm/clients', () =>
          HttpResponse.json(
            { success: false, message: 'Não foi possível carregar os clientes.' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitForOverview(canvas);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Segmentos' }, { timeout: 10000 })
    );
    await canvas.findByText('Não foi possível carregar os clientes.', {}, { timeout: 10000 });
  },
};

/** Falha da previsão (GET /api/crm/forecast → 500): banner na aba Previsões. */
export const ErroPrevisao: Story = {
  parameters: {
    msw: {
      handlers: [
        overviewOk,
        http.get('/api/crm/forecast', () =>
          HttpResponse.json(
            { success: false, message: 'Não foi possível carregar a previsão.' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitForOverview(canvas);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Previsões' }, { timeout: 10000 })
    );
    await canvas.findByText('Não foi possível carregar a previsão.', {}, { timeout: 10000 });
  },
};
