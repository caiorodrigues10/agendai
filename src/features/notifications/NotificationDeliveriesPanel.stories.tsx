import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { within } from 'storybook/test';
import { NotificationDeliveriesPanel } from './NotificationDeliveriesPanel';
import type { NotificationDelivery } from '../../infra/notificationsApi';

const deliveries: NotificationDelivery[] = [
  {
    id: 'nd-1',
    channel: 'WHATSAPP',
    type: 'APPOINTMENT_REMINDER',
    status: 'FAILED',
    destinationMasked: '5511*****0001',
    attemptCount: 3,
    lastErrorCode: 'RATE_LIMITED',
    createdAt: '2026-10-01T14:00:00.000Z',
    failedAt: '2026-10-01T14:05:00.000Z',
  },
  {
    id: 'nd-2',
    channel: 'EMAIL',
    type: 'APPOINTMENT_CONFIRMATION',
    status: 'DELIVERED',
    destinationMasked: 'm***@example.com',
    attemptCount: 1,
    createdAt: '2026-10-01T15:00:00.000Z',
    deliveredAt: '2026-10-01T15:01:00.000Z',
  },
];

const jsonList = (items: NotificationDelivery[]) =>
  HttpResponse.json({
    success: true,
    data: items,
    meta: { total: items.length, page: 1, limit: 10, totalPages: 1 },
  });

const mswHandlers = () => [http.get('/api/notifications/deliveries', () => jsonList(deliveries))];

const meta = {
  title: 'Notificações/NotificationDeliveriesPanel',
  component: NotificationDeliveriesPanel,
  tags: ['autodocs', 'test'],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers() },
  },
} satisfies Meta<typeof NotificationDeliveriesPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Falha do load (GET /api/notifications/deliveries → 500): card de erro com retry. */
export const Erro: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/notifications/deliveries', () =>
          HttpResponse.json(
            {
              success: false,
              message: 'Não foi possível carregar o histórico de notificações.',
            },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async () => {
    await within(document.body).findByText(
      'Não foi possível carregar o histórico de notificações.',
      {},
      { timeout: 10000 }
    );
  },
};
