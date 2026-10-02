import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { fn } from 'storybook/test';
import { FinancialDashboard } from './FinancialDashboard';
import { services, staff } from '../../appointments/storyFixtures';
import type { QueueItem } from '../../../types';

const completedItem = (id: string, name: string, price: number): QueueItem => ({
  id,
  customerName: name,
  whatsapp: '5511999990000',
  serviceId: 'svc-1',
  joinedAt: Date.parse('2026-09-28T13:00:00.000Z'),
  status: 'completed',
  completedAt: Date.parse('2026-09-28T14:00:00.000Z'),
  finalPrice: price,
  paymentMethod: 'pix',
});

const queueHistory = [
  completedItem('q-1', 'Carlos Mendes', 55),
  completedItem('q-2', 'Rafael Duarte', 35),
  completedItem('q-3', 'Pedro Alves', 85),
];

const insights = {
  period: '30d',
  from: '2026-09-01',
  to: '2026-10-01',
  kpis: {
    revenue: 28450,
    completedServices: 412,
    avgTicket: 69,
    avgWaitMinutes: 18,
    queueCancelRate: 0.04,
    appointmentCancelRate: 0.07,
    returningCustomerRate: 0.62,
    uniqueCustomers: 187,
    expenses: 6120,
    netProfit: 9840,
    openFiado: 1450,
    overdueFiado: 320,
  },
  byWeekday: [
    { day: 'mon', label: 'Seg', volume: 62, revenue: 4100 },
    { day: 'tue', label: 'Ter', volume: 48, revenue: 3200 },
    { day: 'wed', label: 'Qua', volume: 55, revenue: 3650 },
    { day: 'thu', label: 'Qui', volume: 51, revenue: 3400 },
    { day: 'fri', label: 'Sex', volume: 74, revenue: 5100 },
    { day: 'sat', label: 'Sáb', volume: 92, revenue: 6800 },
    { day: 'sun', label: 'Dom', volume: 30, revenue: 2200 },
  ],
  byHour: [
    { hour: 9, label: '09h', volume: 12 },
    { hour: 14, label: '14h', volume: 22 },
    { hour: 18, label: '18h', volume: 19 },
  ],
  topServices: [
    { serviceId: 'svc-1', name: 'Corte + Barba', count: 154, revenue: 8470 },
    { serviceId: 'svc-2', name: 'Corte social', count: 143, revenue: 5005 },
    { serviceId: 'svc-3', name: 'Barba', count: 115, revenue: 3450 },
  ],
  byStaff: [
    { staffId: 'st-1', name: 'Ana Souza', count: 240, revenue: 16200 },
    { staffId: 'st-2', name: 'Bruno Lima', count: 172, revenue: 12250 },
  ],
  appointments: { total: 210, confirmed: 188, completed: 163, cancelled: 25 },
  inactiveCustomers: [],
  highlights: ['Sábado teve a maior receita do período.', 'Ticket médio subiu 8% vs. mês anterior.'],
};

const commissions = {
  grossTotal: 28450,
  commissionTotal: 8535,
  byProfessional: [
    { professionalId: 'st-1', professionalName: 'Ana Souza', commissionTotal: 4860, entryCount: 240 },
    { professionalId: 'st-2', professionalName: 'Bruno Lima', commissionTotal: 3675, entryCount: 172 },
  ],
};

const weatherPrediction = {
  date: '2026-10-03',
  condition: 'Chuva moderada',
  predictedQueue: 5,
  confidenceLow: 3,
  confidenceHigh: 8,
  baselineAvg: 10,
  dropPct: -48,
  topFactors: [{ feature: 'chuva', impact: -0.5 }],
  recommendation: 'Antecipe o fechamento.',
  riskLevel: 'medium' as const,
};

const weatherInsights = {
  barbershopName: 'Barbearia Central',
  location: { lat: -23.55, lng: -46.63 },
  historicalDays: 90,
  modelTrained: true,
  predictions: [weatherPrediction],
  forecast: [
    { date: '2026-10-02', weatherCode: 3, tempMax: 27, tempMin: 18, precipMm: 0, precipProbability: 10, condition: 'Nublado', conditionIcon: 'cloudy' },
    { date: '2026-10-03', weatherCode: 61, tempMax: 22, tempMin: 17, precipMm: 8.4, precipProbability: 85, condition: 'Chuva moderada', conditionIcon: 'rain' },
  ],
  summary: {
    avgDropPct: -48,
    highRiskCount: 1,
    bestDay: weatherPrediction,
    worstDay: weatherPrediction,
  },
  highlights: [],
};

const json = (data: unknown) => HttpResponse.json({ success: true, data });

const mswHandler = (opts: { insightsFail?: boolean } = {}) => [
  http.get('/api/barbershop/insights', () =>
    opts.insightsFail
      ? HttpResponse.json(
          { success: false, code: 'DASHBOARD_REQUIRED', message: 'Relatórios disponíveis no plano Pro.' },
          { status: 403 }
        )
      : json(insights)
  ),
  http.get('/api/commissions/summary', () => json(commissions)),
  http.get('/api/barbershop/weather-insights', () => json(weatherInsights)),
];

const meta = {
  title: 'Financeiro/FinancialDashboard',
  component: FinancialDashboard,
  tags: ['autodocs', 'test'],
  decorators: [
    Story => (
      <MemoryRouter initialEntries={['/dashboard']}>
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandler() },
  },
  args: {
    queueHistory,
    services,
    currentUser: staff[0],
    allStaff: staff,
    onDeleteHistoryItem: fn(),
  },
} satisfies Meta<typeof FinancialDashboard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PlanoUpgrade: Story = {
  parameters: { msw: { handlers: mswHandler({ insightsFail: true }) } },
};
