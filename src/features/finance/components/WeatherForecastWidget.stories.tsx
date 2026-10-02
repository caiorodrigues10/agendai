import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { WeatherForecastWidget } from './WeatherForecastWidget';

const prediction = {
  date: '2026-10-03',
  condition: 'Chuva moderada',
  predictedQueue: 4,
  confidenceLow: 2,
  confidenceHigh: 7,
  baselineAvg: 9,
  dropPct: -52,
  topFactors: [{ feature: 'chuva', impact: -0.6 }],
  recommendation: 'Escale apenas 1 barbeiro no fim da tarde.',
  riskLevel: 'high' as const,
};

const forecast = [
  { date: '2026-10-02', weatherCode: 3, tempMax: 27, tempMin: 18, precipMm: 0, precipProbability: 10, condition: 'Nublado', conditionIcon: 'cloudy' },
  { date: '2026-10-03', weatherCode: 61, tempMax: 22, tempMin: 17, precipMm: 8.4, precipProbability: 85, condition: 'Chuva moderada', conditionIcon: 'rain' },
  { date: '2026-10-04', weatherCode: 1, tempMax: 29, tempMin: 19, precipMm: 0, precipProbability: 5, condition: 'Ensolarado', conditionIcon: 'sun' },
];

const insights = {
  barbershopName: 'Barbearia Central',
  location: { lat: -23.55, lng: -46.63 },
  historicalDays: 90,
  modelTrained: true,
  predictions: [prediction],
  forecast,
  summary: {
    avgDropPct: -52,
    highRiskCount: 1,
    bestDay: prediction,
    worstDay: prediction,
  },
  highlights: ['Sábado costuma ter 40% mais fila.'],
};

const mswHandler = (data: unknown) => [
  http.get('/api/barbershop/weather-insights', () =>
    HttpResponse.json({ success: true, data })
  ),
];

const meta = {
  title: 'Financeiro/WeatherForecastWidget',
  component: WeatherForecastWidget,
  tags: ['autodocs', 'test'],
  parameters: {
    layout: 'centered',
    msw: { handlers: mswHandler(insights) },
  },
} satisfies Meta<typeof WeatherForecastWidget>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compacto: Story = {
  args: { compact: true },
};

export const Erro: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/barbershop/weather-insights', () =>
          HttpResponse.json(
            { success: false, message: 'Erro interno' },
            { status: 500 }
          )
        ),
      ],
    },
  },
};

export const SemDados: Story = {
  parameters: {
    msw: {
      handlers: mswHandler({ ...insights, modelTrained: false, predictions: [], forecast: [] }),
    },
  },
};
