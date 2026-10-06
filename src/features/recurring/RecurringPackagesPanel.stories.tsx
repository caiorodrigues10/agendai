import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { fireEvent, userEvent, within } from 'storybook/test';
import { RecurringPackagesPanel } from './RecurringPackagesPanel';
import { StoryProviders } from '../../tests/storyProviders';

const json = (data: unknown) => HttpResponse.json({ success: true, data });

const plans = [
  {
    id: 'p1',
    name: 'Clube Mensal',
    description: '2 cortes por mês',
    price: 120,
    billingCycle: 'MONTHLY',
    isActive: true,
    benefits: [{ id: 'b1', serviceId: 'svc-1', type: 'SESSION', quantity: 2, discountPercent: 0, description: '2 cortes' }],
  },
];

const memberships = [
  {
    id: 'cr1',
    planId: 'p1',
    planName: 'Clube Mensal',
    clientId: 'c1',
    clientName: 'João Silva',
    status: 'ACTIVE',
    startDate: '2026-10-01',
    currentPeriodEnd: '2026-11-01',
    cycles: [
      {
        id: 'cy1',
        periodStart: '2026-10-01',
        periodEnd: '2026-10-31',
        dueDate: '2026-11-01',
        amount: 120,
        status: 'UNPAID',
      },
    ],
    usageSummary: [{ benefitId: 'b1', used: 1, total: 2 }],
  },
];

const mswHandlers = (data: { plans: unknown[]; memberships: unknown[] }) => [
  http.get('/api/barbershops/:id/recurring-package-plans', () => json(data.plans)),
  http.get('/api/barbershops/:id/client-recurring-packages', () => json(data.memberships)),
];

const meta = {
  title: 'Recorrência/RecurringPackagesPanel',
  component: RecurringPackagesPanel,
  tags: ['autodocs', 'test'],
  decorators: [
    Story => (
      <StoryProviders>
        <Story />
      </StoryProviders>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers({ plans, memberships }) },
  },
} satisfies Meta<typeof RecurringPackagesPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Vazio: Story = {
  parameters: { msw: { handlers: mswHandlers({ plans: [], memberships: [] }) } },
};

/**
 * Falha da criação de modelo (POST /api/barbershops/:id/recurring-package-plans
 * → 500): abre o modal "Criar modelo", preenche nome e preço e submete — o
 * banner `bg-danger/10` (RecurringPackagesPanel.tsx:384) fica visível com o
 * modal aberto.
 */
export const ErroPlano: Story = {
  parameters: {
    msw: {
      handlers: [
        ...mswHandlers({ plans, memberships }),
        http.post('/api/barbershops/:id/recurring-package-plans', () =>
          HttpResponse.json(
            { success: false, message: 'Não foi possível salvar o modelo.' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Pacotes recorrentes', {}, { timeout: 10000 });
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Criar modelo' }, { timeout: 10000 })
    );
    await canvas.findByRole('heading', { name: 'Criar modelo' }, { timeout: 10000 });
    fireEvent.change(
      await canvas.findByLabelText('Nome do modelo', {}, { timeout: 10000 }),
      { target: { value: 'Clube Teste' } }
    );
    fireEvent.change(await canvas.findByLabelText('Preço (R$)', {}, { timeout: 10000 }), {
      target: { value: '99.90' },
    });
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Criar' }, { timeout: 10000 })
    );
    await canvas.findByText(/Não foi possível salvar o modelo/, {}, { timeout: 10000 });
    await canvas.findByRole('heading', { name: 'Criar modelo' }, { timeout: 10000 });
  },
};
