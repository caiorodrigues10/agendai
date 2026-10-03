import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { fn } from 'storybook/test';
import type { ClientPackage } from '../../types';
import { BookPackageSessionsModal } from './BookPackageSessionsModal';
import { settings, staff } from './storyFixtures';

// Congela o relógio: o modal deriva data/semana/slots de `new Date()`, sem o que o
// snapshot visual vence todo dia. Mantido em 2026-10-01 (data em que o snapshot foi gerado).
const FROZEN_NOW = new Date('2026-10-01T12:00:00');
const RealDate = Date;
const FrozenDate = class extends RealDate {
  constructor(...args: unknown[]) {
    if (args.length === 0) {
      super(FROZEN_NOW.getTime());
    } else {
      super(...(args as ConstructorParameters<typeof RealDate>));
    }
  }
  static now() {
    return FROZEN_NOW.getTime();
  }
} as DateConstructor;
globalThis.Date = FrozenDate;

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
