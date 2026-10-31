import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { ClientPortalDashboard } from './ClientPortalDashboard';

const json = (data: unknown) => HttpResponse.json({ success: true, data });
const handlers = [
  http.get('/api/client/portal/me', () =>
    json({ id: 'client', name: 'Ana Souza', phone: '(11) 99999-0000', phoneVerified: true })
  ),
  http.get('/api/client/portal/my-links', () =>
    json([
      {
        id: 'link-1',
        barbershopId: 'salon-1',
        barbershop: { name: 'Salão Aurora' },
        status: 'CONFIRMED',
      },
    ])
  ),
  http.get('/api/client/portal/dashboard', () =>
    json({
      recentAppointments: [
        {
          id: 'appointment-1',
          service: { name: 'Corte e finalização', price: 90 },
          barbershop: { name: 'Salão Aurora' },
          staff: { name: 'Beatriz' },
          date: '2026-10-28',
          time: '14:30',
          status: 'CONFIRMED',
        },
      ],
      benefits: [
        { description: 'Pacote de cortes', available: 3, used: 1, validUntil: '2026-12-31' },
      ],
    })
  ),
  http.post('/api/client/portal/my-links/:id/revoke', () => json({})),
];
const meta = {
  title: 'Cliente/Minha conta',
  component: ClientPortalDashboard,
  tags: ['test'],
  decorators: [
    Story => (
      <main className="px-4">
        <Story />
      </main>
    ),
  ],
  parameters: { msw: { handlers } },
} satisfies Meta<typeof ClientPortalDashboard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ComDados: Story = {};
export const SemDados: Story = {
  parameters: {
    msw: { handlers: [http.get('/api/client/portal/my-links', () => json([])), ...handlers] },
  },
};
export const ErroAgenda: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/client/portal/dashboard', () =>
          HttpResponse.json({ message: 'Indisponível' }, { status: 503 })
        ),
        ...handlers,
      ],
    },
  },
};
