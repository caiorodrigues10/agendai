import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { CashPanel } from './CashPanel';
import { StoryProviders } from '../../../tests/storyProviders';

const json = (data: unknown) => HttpResponse.json({ success: true, data });

const summary = {
  date: '2026-10-04',
  movements: [],
  total: 1250,
  byMethod: {
    CASH: { count: 3, total: 450 },
    PIX: { count: 2, total: 800 },
    CREDIT_CARD: { count: 1, total: 0 },
    DEBIT_CARD: { count: 0, total: 0 },
    FIADO: { count: 0, total: 0 },
  },
};

const movements = [
  {
    id: 'm1',
    barbershopId: 'shop-1',
    type: 'SERVICE_SALE',
    amount: 80,
    paymentMethod: 'PIX',
    description: 'Corte + barba',
    createdBy: 'u1',
    createdAt: '2026-10-04T13:05:00.000Z',
  },
  {
    id: 'm2',
    barbershopId: 'shop-1',
    type: 'EXPENSE',
    amount: 120,
    paymentMethod: 'CASH',
    description: 'Compra de produtos',
    createdBy: 'u1',
    createdAt: '2026-10-04T10:20:00.000Z',
  },
];

const mswHandlers = (opts: { empty?: boolean; fail?: boolean } = {}) => {
  if (opts.fail) {
    const fail = () =>
      HttpResponse.json({ success: false, message: 'Erro interno' }, { status: 500 });
    return [http.get('/api/barbershops/:id/cash/summary', fail), http.get('/api/barbershops/:id/cash/movements', fail)];
  }
  return [
    http.get('/api/barbershops/:id/cash/summary', () => json(summary)),
    http.get('/api/barbershops/:id/cash/movements', () => json(opts.empty ? [] : movements)),
  ];
};

const meta = {
  title: 'Financeiro/CashPanel',
  component: CashPanel,
  tags: ['autodocs', 'test'],
  decorators: [
    Story => (
      <StoryProviders withAuth>
        <Story />
      </StoryProviders>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers() },
  },
} satisfies Meta<typeof CashPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Vazio: Story = {
  parameters: { msw: { handlers: mswHandlers({ empty: true }) } },
};

export const Erro: Story = {
  parameters: { msw: { handlers: mswHandlers({ fail: true }) } },
};
