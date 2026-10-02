import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { DemandAlertBanner } from './DemandAlertBanner';

const prediction = {
  date: '2026-10-03',
  condition: 'Chuva forte',
  predictedQueue: 3,
  confidenceLow: 1,
  confidenceHigh: 6,
  baselineAvg: 10,
  dropPct: -64,
  topFactors: [{ feature: 'chuva', impact: -0.7 }],
  recommendation: 'Reduza a escala e antecipe o fechamento em 1h.',
  riskLevel: 'critical' as const,
};

const mswHandler = (data: Record<string, unknown>) => [
  http.get('/api/barbershop/weather-insights', () =>
    HttpResponse.json({ success: true, data })
  ),
];

const baseInsights = {
  barbershopName: 'Barbearia Central',
  location: { lat: -23.55, lng: -46.63 },
  historicalDays: 90,
  modelTrained: true,
  predictions: [prediction],
  summary: {
    avgDropPct: -64,
    highRiskCount: 1,
    bestDay: prediction,
    worstDay: prediction,
  },
  highlights: [],
};

const meta = {
  title: 'Financeiro/DemandAlertBanner',
  component: DemandAlertBanner,
  tags: ['autodocs', 'test'],
  parameters: {
    layout: 'centered',
    msw: { handlers: mswHandler(baseInsights) },
  },
} satisfies Meta<typeof DemandAlertBanner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Critico: Story = {
  args: { compact: false },
};

export const Compacto: Story = {
  args: { compact: true },
};

export const RiscoMedio: Story = {
  args: { compact: false },
  parameters: {
    msw: {
      handlers: mswHandler({
        ...baseInsights,
        predictions: [{ ...prediction, riskLevel: 'medium', dropPct: -25, condition: 'Pancadas de chuva' }],
      }),
    },
  },
};
