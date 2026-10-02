import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { fn } from 'storybook/test';
import { QueueCapacityBanner } from './QueueCapacityBanner';

const alertData = {
  enabled: true,
  threshold: 5,
  phone: null,
  currentWaiting: 9,
  exceeded: true,
  whatsappConnected: false,
  queueEnabled: true,
};

const mswHandler = (overrides: Partial<typeof alertData> = {}) => [
  http.get('/api/barbershops/:id/queue-alert', () =>
    HttpResponse.json({ success: true, data: { ...alertData, ...overrides } })
  ),
];

const meta = {
  title: 'Fila/QueueCapacityBanner',
  component: QueueCapacityBanner,
  tags: ['autodocs', 'test'],
  parameters: {
    layout: 'centered',
    msw: { handlers: mswHandler() },
  },
  args: {
    barbershopId: 'shop-1',
    waiting: 9,
    onNavigate: fn(),
    canConfigure: false,
  },
} satisfies Meta<typeof QueueCapacityBanner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Exceeded: Story = {};

export const WithConfigureAction: Story = {
  args: { canConfigure: true },
  parameters: { msw: { handlers: mswHandler({ whatsappConnected: true }) } },
};

export const WithinLimit: Story = {
  args: { waiting: 3 },
};
