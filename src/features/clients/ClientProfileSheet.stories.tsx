import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { fn, userEvent, within } from 'storybook/test';
import { ClientProfileSheet } from './ClientProfileSheet';
import { services, settings, staff } from '../appointments/storyFixtures';
import type { CrmClientProfile } from '../../infra/crmApi';
import type { ProcedureRecord } from '../../infra/clientsApi';
import type { SalonClient, ServicePackage } from '../../types';

const json = (data: unknown) => HttpResponse.json({ success: true, data });

const client: SalonClient = {
  id: 'cli-1',
  barbershopId: 'shop-1',
  name: 'Maria Silva',
  whatsapp: '5511999990001',
  notes: 'Prefere máquina 2 e acabamento fino. Chega sempre 10 min antes.',
  remainingSessions: 3,
  activePackageCount: 1,
  createdAt: '2026-03-12T10:00:00.000Z',
  updatedAt: '2026-09-30T18:00:00.000Z',
  packages: [
    {
      id: 'cp-1',
      packageId: 'pk-1',
      packageName: 'Pacote Corte Mensal',
      serviceId: 'svc-2',
      serviceName: 'Corte social',
      totalSessions: 8,
      remainingSessions: 3,
      status: 'ACTIVE',
      purchasedAt: '2026-08-15T14:00:00.000Z',
      expiresAt: '2026-12-15T14:00:00.000Z',
      pricePaid: 240,
      paymentMethod: 'pix',
    },
  ],
  appointments: [
    {
      id: 'ap-1',
      serviceId: 'svc-1',
      serviceName: 'Corte + Barba',
      date: '2026-09-28',
      time: '14:00',
      status: 'completed',
      clientPackageId: null,
    },
    {
      id: 'ap-2',
      serviceId: 'svc-2',
      serviceName: 'Corte social',
      date: '2026-10-06',
      time: '10:30',
      status: 'confirmed',
      clientPackageId: 'cp-1',
    },
  ],
};

const crmProfile: CrmClientProfile = {
  clientId: 'cli-1',
  name: 'Maria Silva',
  whatsapp: '5511999990001',
  ltv: 1840,
  grossRevenue: 1840,
  receivedRevenue: 1720,
  outstanding: 120,
  visits: 24,
  avgTicket: 76.67,
  lastVisitAt: '2026-09-28',
  nextExpectedVisitAt: '2026-10-06',
  daysSinceLastVisit: 7,
  risk: 'low',
  segment: 'recurring',
  favoriteService: 'Corte social',
  activePackageSessions: 3,
  marketingOptIn: true,
  timeline: [
    {
      id: 'ev-1',
      kind: 'service_sale',
      grossAmount: 55,
      receivedAmount: 55,
      outstandingDelta: 0,
      occurredAt: '2026-09-28T14:30:00.000Z',
    },
    {
      id: 'ev-2',
      kind: 'package_sale',
      grossAmount: 240,
      receivedAmount: 120,
      outstandingDelta: 120,
      occurredAt: '2026-08-15T14:00:00.000Z',
    },
  ],
  fiados: [
    {
      id: 'fio-1',
      amount: 180,
      outstanding: 120,
      status: 'PENDING',
      createdAt: '2026-08-15T14:05:00.000Z',
    },
  ],
};

const catalog: ServicePackage[] = [
  {
    id: 'pk-1',
    barbershopId: 'shop-1',
    serviceId: 'svc-2',
    serviceName: 'Corte social',
    servicePrice: 35,
    name: 'Pacote Corte Mensal',
    sessionCount: 8,
    price: 240,
    validityDays: 120,
    active: true,
  },
  {
    id: 'pk-2',
    barbershopId: 'shop-1',
    serviceId: 'svc-3',
    serviceName: 'Barba',
    servicePrice: 30,
    name: 'Pacote Barba',
    sessionCount: 10,
    price: 250,
    validityDays: 90,
    active: true,
  },
];

const procedures: ProcedureRecord[] = [
  {
    id: 'pr-1',
    barbershopId: 'shop-1',
    clientId: 'cli-1',
    professionalName: 'Ana Souza',
    title: 'Corte degradê',
    formula: 'Máquina 2 nas laterais, tesoura no topo',
    details: 'Acabamento fino nas laterais',
    serviceName: 'Corte social',
    queueItemId: null,
    appointmentId: 'ap-1',
    occurredAt: '2026-09-28T14:00:00.000Z',
    createdAt: '2026-09-28T15:00:00.000Z',
    updatedAt: '2026-09-28T15:00:00.000Z',
  },
  {
    id: 'pr-2',
    barbershopId: 'shop-1',
    clientId: 'cli-1',
    professionalName: 'Bruno Lima',
    title: 'Barba aparada',
    formula: 'Toalha quente + navalha',
    details: null,
    serviceName: 'Barba',
    queueItemId: null,
    appointmentId: null,
    occurredAt: '2026-09-14T11:00:00.000Z',
    createdAt: '2026-09-14T11:30:00.000Z',
    updatedAt: '2026-09-14T11:30:00.000Z',
  },
];

const mswHandlers = [
  http.get('/api/clients/:id', () => json(client)),
  http.get('/api/crm/clients/:id', () => HttpResponse.json({ data: crmProfile })),
  http.get('/api/service-packages', () => json(catalog)),
  http.get('/api/clients/:id/procedures', () => json(procedures)),
];

const meta = {
  title: 'Clientes/ClientProfileSheet',
  component: ClientProfileSheet,
  tags: ['autodocs', 'test'],
  parameters: {
    layout: 'centered',
    msw: { handlers: mswHandlers },
  },
  args: {
    clientId: 'cli-1',
    services,
    staff,
    settings,
    canCancelSale: true,
    canAnalytics: true,
    onClose: fn(),
    onUpdated: fn(),
    onBook: fn(),
  },
} satisfies Meta<typeof ClientProfileSheet>;
export default meta;
type Story = StoryObj<typeof meta>;

/** O sheet usa `createPortal(..., document.body)`, então fora de `#storybook-root`. */
const sheet = () => within(document.body);

const openTab = async (label: string, waitFor: string) => {
  const body = sheet();
  await userEvent.click(body.getByRole('button', { name: label }));
  await body.findByText(waitFor, {}, { timeout: 10000 });
};

export const Default: Story = {};

export const Pacotes: Story = {
  play: async () => {
    await openTab('Pacotes', 'Pacotes vendidos');
  },
};

export const Historico: Story = {
  play: async () => {
    await openTab('Histórico', 'Corte degradê');
  },
};

export const Financeiro: Story = {
  play: async () => {
    await openTab('Financeiro', 'Timeline financeira');
  },
};

/** Sem `canAnalytics` a aba "Financeiro" nem aparece na navegação. */
export const SemAnalitico: Story = {
  args: { canAnalytics: false },
};

/** Falha do `loadDetail` (GET /api/clients/:id → 500): banner de erro no corpo do sheet. */
export const Erro: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/clients/:id', () =>
          HttpResponse.json(
            { success: false, message: 'Não foi possível carregar o cliente' },
            { status: 500 }
          )
        ),
        http.get('/api/crm/clients/:id', () => HttpResponse.json({ data: crmProfile })),
        http.get('/api/service-packages', () => json(catalog)),
        http.get('/api/clients/:id/procedures', () => json(procedures)),
      ],
    },
  },
  play: async () => {
    await sheet().findByText('Não foi possível carregar o cliente', {}, { timeout: 10000 });
  },
};
