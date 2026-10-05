import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { fireEvent, userEvent, within } from 'storybook/test';
import { OwnerFinancialPanel } from './OwnerFinancialPanel';
import { StoryProviders } from '../../../tests/storyProviders';

const json = (data: unknown, meta?: unknown) =>
  HttpResponse.json(meta ? { success: true, data, meta } : { success: true, data });

const financialSummary = {
  expenses: {
    total: 4750,
    totalPaid: 3500,
    totalPending: 1250,
    count: 3,
    byType: [
      { type: 'FIXED', count: 2, total: 3930 },
      { type: 'VARIABLE', count: 1, total: 820 },
    ],
  },
  fiados: {
    activeDebtors: 4,
    totalOriginal: 3200,
    totalPaid: 1450,
    totalPending: 1750,
    overdueCount: 2,
    overdueAmount: 620,
  },
  packages: { count: 3, totalPaid: 960 },
  products: {
    revenue: 5400,
    netRevenue: 5100,
    refunded: 300,
    cogs: 2100,
    margin: 3000,
    saleCount: 42,
    inventoryValue: 8400,
    lowStockCount: 2,
    stockPurchases: 1200,
  },
};

const cashSummary = {
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

const categories = [
  {
    id: 'c1',
    barbershopId: 'shop-1',
    name: 'Aluguel',
    color: '#2cb58a',
    description: null,
    icon: null,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'c2',
    barbershopId: 'shop-1',
    name: 'Insumos',
    color: '#60a5fa',
    description: null,
    icon: null,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const expenses = [
  {
    id: 'ex1',
    barbershopId: 'shop-1',
    title: 'Aluguel do salão',
    supplierName: 'Imobiliária Centro',
    categoryId: 'c1',
    categoryName: 'Aluguel',
    type: 'FIXED',
    amount: 3500,
    referenceDate: '2026-10-01',
    dueDate: '2026-10-05',
    paidAt: '2026-10-01T13:00:00.000Z',
    paymentMethod: 'CASH',
    description: 'Mensalidade',
    notes: '',
    recurrence: 'MONTHLY',
  },
  {
    id: 'ex2',
    barbershopId: 'shop-1',
    title: 'Compra de produtos',
    supplierName: 'Distribuidora Central',
    categoryId: 'c2',
    categoryName: 'Insumos',
    type: 'VARIABLE',
    amount: 820,
    referenceDate: '2026-10-02',
    dueDate: '2026-10-09',
    paidAt: null,
    paymentMethod: null,
    description: 'Shampoo e pomada',
    notes: '',
    recurrence: 'ONCE',
  },
  {
    id: 'ex3',
    barbershopId: 'shop-1',
    title: 'Conta de energia',
    supplierName: 'Enel',
    categoryId: null,
    categoryName: null,
    type: 'FIXED',
    amount: 430,
    referenceDate: '2026-10-03',
    dueDate: '2026-10-10',
    paidAt: null,
    paymentMethod: null,
    description: null,
    notes: '',
    recurrence: 'MONTHLY',
  },
];

const expenseSummary = {
  totalAmount: 4750,
  totalPaid: 3500,
  totalPending: 1250,
  byCategory: [
    { categoryId: 'c1', categoryName: 'Aluguel', count: 1, total: 3500 },
    { categoryId: 'c2', categoryName: 'Insumos', count: 1, total: 820 },
    { categoryId: '', categoryName: 'Sem categoria', count: 1, total: 430 },
  ],
  byType: [],
  byMonth: [],
};

const fiados = [
  {
    id: 'f1',
    barbershopId: 'shop-1',
    customerName: 'Rafael Duarte',
    whatsapp: '5511977770000',
    description: 'Corte + barba (2 sessões)',
    createdAt: '2026-09-28T15:00:00.000Z',
    status: 'PENDING',
    isOverdue: true,
    originalAmount: 180,
    remainingAmount: 120,
  },
  {
    id: 'f2',
    barbershopId: 'shop-1',
    customerName: 'Marcos Prado',
    whatsapp: '5511966660000',
    description: 'Barba + hidratação',
    createdAt: '2026-10-01T17:30:00.000Z',
    status: 'PARTIAL',
    isOverdue: false,
    originalAmount: 90,
    remainingAmount: 45,
  },
];

const mswHandlers = [
  http.get('/api/barbershop/financial/summary', () => json(financialSummary)),
  http.get('/api/barbershops/:id/cash/summary', () => json(cashSummary)),
  http.get('/api/expense-categories', () => json(categories)),
  http.get('/api/expenses', () => json(expenses, { total: 3, page: 1, limit: 20, totalPages: 1 })),
  http.get('/api/expenses/summary', () => json(expenseSummary)),
  http.get('/api/fiado', () => json(fiados, { total: 2, page: 1, limit: 20, totalPages: 1 })),
];

const meta = {
  title: 'Financeiro/OwnerFinancialPanel',
  component: OwnerFinancialPanel,
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
    msw: { handlers: mswHandlers },
  },
} satisfies Meta<typeof OwnerFinancialPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * O formulário de nova despesa usa `referenceDate: todayISO()`; sem congelar o
 * campo o snapshot visual venceria a cada virada de dia (dívida D-013).
 */
export const Despesas: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Despesas' }));
    await canvas.findByText('Aluguel do salão', {}, { timeout: 10000 });
    fireEvent.change(canvas.getByLabelText('Data de referência'), {
      target: { value: '2026-10-01' },
    });
  },
};

export const Fiado: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Fiado' }));
    await canvas.findByText('Rafael Duarte', {}, { timeout: 10000 });
  },
};

export const Erro: Story = {
  parameters: {
    msw: {
      handlers: [
        ...mswHandlers,
        http.delete('/api/expenses/:id', () =>
          HttpResponse.json(
            { success: false, message: 'Não foi possível excluir a despesa' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Despesas' }));
    await canvas.findByText('Aluguel do salão', {}, { timeout: 10000 });
    await userEvent.click(canvas.getAllByTitle('Excluir despesa')[0]);
    await userEvent.click(canvas.getByTitle('Confirmar exclusão'));
    await canvas.findByText('Não foi possível excluir a despesa', {}, { timeout: 10000 });
    window.scrollTo(0, 0);
  },
};
