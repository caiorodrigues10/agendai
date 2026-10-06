import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { GoalsPanel } from './GoalsPanel';
import { StoryProviders } from '../../tests/storyProviders';

const json = (data: unknown) => HttpResponse.json({ success: true, data });

const ranking = [
  {
    id: 'g1',
    professionalId: 'st-1',
    professionalName: 'Ana Souza',
    barbershopId: 'shop-1',
    metric: 'REVENUE',
    target: 8000,
    current: 6400,
    percentage: 80,
    period: 'MONTHLY',
    startDate: '2026-10-01',
    endDate: '2026-10-31',
  },
  {
    id: 'g2',
    professionalId: 'st-2',
    professionalName: 'Bruno Lima',
    barbershopId: 'shop-1',
    metric: 'SERVICES',
    target: 120,
    current: 63,
    percentage: 52,
    period: 'MONTHLY',
    startDate: '2026-10-01',
    endDate: '2026-10-31',
  },
];

const mswHandlers = (rows: unknown[] = ranking) => [
  http.get('/api/barbershops/:id/goals/ranking', () => json(rows)),
];

const meta = {
  title: 'Metas/GoalsPanel',
  component: GoalsPanel,
  tags: ['autodocs', 'test'],
  decorators: [
    Story => (
      <StoryProviders withBarbershop>
        <Story />
      </StoryProviders>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers() },
  },
} satisfies Meta<typeof GoalsPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Vazio: Story = {
  parameters: { msw: { handlers: mswHandlers([]) } },
};

export const Erro: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/barbershops/:id/goals/ranking', () =>
          HttpResponse.json({ success: false, message: 'Erro ao carregar metas' }, { status: 500 })
        ),
      ],
    },
  },
};

/**
 * Falha da criação (POST /api/barbershops/:id/goals → 500): banner dentro do
 * modal "Criar meta". O select de profissional precisa da equipe (`/staff`).
 */
export const ErroSalvar: Story = {
  parameters: {
    msw: {
      handlers: [
        ...mswHandlers(),
        http.get('/api/barbershops/:id/staff', () =>
          json([{ id: 'st-1', name: 'Ana Souza' }])
        ),
        http.post('/api/barbershops/:id/goals', () =>
          HttpResponse.json(
            { success: false, message: 'Não foi possível criar a meta.' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Metas Profissionais', {}, { timeout: 10000 });
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Criar meta' }, { timeout: 10000 })
    );
    const combos = await canvas.findAllByRole('combobox', {}, { timeout: 10000 });
    await userEvent.click(combos[0]);
    const body = within(document.body);
    const option = await body.findByRole('option', { name: 'Ana Souza' }, { timeout: 10000 });
    // O popup do SmartSelect pode reposicionar entre pointerdown/pointerup e o
    // clique coordenado acaba no ancestral (seleção silenciosamente perdida) —
    // dispara o evento direto no elemento.
    fireEvent.click(option);
    await waitFor(() => expect(combos[0].textContent).toContain('Ana Souza'), { timeout: 10000 });
    await userEvent.type(
      await canvas.findByPlaceholderText('Ex: 5000', {}, { timeout: 10000 }),
      '5000'
    );
    const dates = canvasElement.querySelectorAll('input[type="date"]');
    fireEvent.change(dates[0], { target: { value: '2026-10-05' } });
    fireEvent.change(dates[1], { target: { value: '2026-10-31' } });
    const submit = await waitFor(
      async () => {
        const buttons = await canvas.findAllByRole(
          'button',
          { name: 'Criar meta' },
          { timeout: 10000 }
        );
        const button = buttons[buttons.length - 1];
        expect(button).not.toBeDisabled();
        return button;
      },
      { timeout: 10000 }
    );
    await userEvent.click(submit);
    await body.findByText(/Não foi possível criar a meta/, {}, { timeout: 10000 });
  },
};
