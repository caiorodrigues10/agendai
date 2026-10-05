import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { fn, userEvent, within } from 'storybook/test';
import type { ClientPackage } from '../../types';
import { BookPackageSessionsModal } from './BookPackageSessionsModal';
import { settings, staff } from './storyFixtures';

const pkg: ClientPackage = {
  id: 'cp-1',
  barbershopId: 'shop-1',
  clientId: 'cli-1',
  clientName: 'Maria Silva',
  clientWhatsapp: '5511999990000',
  packageId: 'pk-1',
  packageName: 'Pacote Corte Mensal',
  serviceId: 'svc-1',
  serviceName: 'Corte + Barba',
  serviceDurationMinutes: 50,
  totalSessions: 8,
  remainingSessions: 5,
  pricePaid: 360,
  paymentMethod: 'pix',
  status: 'ACTIVE',
  purchasedAt: '2026-09-01T12:00:00.000Z',
  expiresAt: '2026-12-01T12:00:00.000Z',
};

const availabilityHandler = [
  http.get('/api/appointments/availability', () =>
    HttpResponse.json({ success: true, data: [] })
  ),
];

const meta = {
  title: 'Agenda/BookPackageSessionsModal',
  component: BookPackageSessionsModal,
  tags: ['autodocs', 'test'],
  parameters: { layout: 'centered', msw: { handlers: availabilityHandler } },
  args: {
    pkg,
    staff,
    settings,
    onBooked: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof BookPackageSessionsModal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LastSession: Story = {
  args: { pkg: { ...pkg, remainingSessions: 1 } },
};

export const Erro: Story = {
  parameters: {
    msw: {
      handlers: [
        ...availabilityHandler,
        http.post('/api/client-packages/:id/book', () =>
          HttpResponse.json(
            { success: false, message: 'Não foi possível agendar as sessões' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async () => {
    const body = within(document.body);
    const slots = await body.findAllByRole('button', { name: /^\d{2}:\d{2}$/ }, { timeout: 10000 });
    await userEvent.click(slots[0]);
    await userEvent.click(
      await body.findByRole('button', { name: /Confirmar 1 horário/ }, { timeout: 10000 })
    );
    await body.findByText('Não foi possível agendar as sessões', {}, { timeout: 10000 });
  },
};
