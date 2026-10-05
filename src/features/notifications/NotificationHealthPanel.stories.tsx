import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { within } from 'storybook/test';
import { NotificationHealthPanel } from './NotificationHealthPanel';

const json = (data: unknown) => HttpResponse.json({ success: true, data });

const health = {
  status: 'HEALTHY',
  worker: { status: 'HEALTHY', heartbeatAt: '2026-10-01T12:00:00.000Z' },
  scheduler: { status: 'HEALTHY', heartbeatAt: '2026-10-01T12:00:00.000Z' },
  outbox: { pending: 0, oldestPendingAt: null },
  queue: { waiting: 2, active: 1, delayed: 0, failed: 0 },
  deliveries: { totalLast15Minutes: 10, failedLast15Minutes: 0, failureRate: 0 },
  checkedAt: '2026-10-01T12:00:00.000Z',
};

const meta = {
  title: 'Notificações/NotificationHealthPanel',
  component: NotificationHealthPanel,
  tags: ['autodocs', 'test'],
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [http.get('/api/admin/operations/notifications', () => json(health))],
    },
  },
} satisfies Meta<typeof NotificationHealthPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Falha do load (GET /api/admin/operations/notifications → 500): card de erro com retry. */
export const Erro: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/admin/operations/notifications', () =>
          HttpResponse.json(
            {
              success: false,
              message: 'Não foi possível consultar a saúde das notificações.',
            },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async () => {
    await within(document.body).findByText(
      'Não foi possível consultar a saúde das notificações.',
      {},
      { timeout: 10000 }
    );
  },
};
