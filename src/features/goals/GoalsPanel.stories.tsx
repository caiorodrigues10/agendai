import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { GoalsPanel } from './GoalsPanel';
import { StoryProviders } from '../../tests/storyProviders';

const json = (data: unknown) => HttpResponse.json({ success: true, data });

const ranking = [
  {
    id: 'g1',
    professionalId: 'st-1',
    professionalName: 'Ana Souza',
    barbershopId: 'shop-1',
    metric: 'REVENUE',
    target: 8000,
    current: 6400,
    percentage: 80,
    period: 'MONTHLY',
    startDate: '2026-10-01',
    endDate: '2026-10-31',
  },
  {
    id: 'g2',
    professionalId: 'st-2',
    professionalName: 'Bruno Lima',
    barbershopId: 'shop-1',
    metric: 'SERVICES',
    target: 120,
    current: 63,
    percentage: 52,
    period: 'MONTHLY',
    startDate: '2026-10-01',
    endDate: '2026-10-31',
  },
];

const mswHandlers = (rows: unknown[] = ranking) => [
  http.get('/api/barbershops/:id/goals/ranking', () => json(rows)),
];

const meta = {
  title: 'Metas/GoalsPanel',
  component: GoalsPanel,
  tags: ['autodocs', 'test'],
  decorators: [
    Story => (
      <StoryProviders withBarbershop>
        <Story />
      </StoryProviders>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers() },
  },
} satisfies Meta<typeof GoalsPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Vazio: Story = {
  parameters: { msw: { handlers: mswHandlers([]) } },
};
