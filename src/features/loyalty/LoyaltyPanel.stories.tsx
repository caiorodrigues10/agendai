import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { userEvent, within } from 'storybook/test';
import { LoyaltyPanel } from './LoyaltyPanel';
import { StoryProviders } from '../../tests/storyProviders';

const json = (data: unknown) => HttpResponse.json({ success: true, data });

const program = {
  id: 'lp-1',
  barbershopId: 'shop-1',
  type: 'VISITS',
  isActive: true,
  config: { visitsRequired: 5, rewardDescription: 'Corte grátis' },
};

const mswHandlers = (data: unknown) => [
  http.get('/api/barbershops/:id/loyalty/program', () => json(data)),
];

const meta = {
  title: 'Fidelidade/LoyaltyPanel',
  component: LoyaltyPanel,
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
    msw: { handlers: mswHandlers(program) },
  },
} satisfies Meta<typeof LoyaltyPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Inativo: Story = {
  parameters: { msw: { handlers: mswHandlers({ ...program, isActive: false }) } },
};

export const Erro: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/barbershops/:id/loyalty/program', () =>
          HttpResponse.json({ success: false, message: 'Erro ao carregar programa' }, { status: 500 })
        ),
      ],
    },
  },
};

/** Falha da submissão (POST program → 500): banner após "Salvar". */
export const ErroSalvar: Story = {
  parameters: {
    msw: {
      handlers: [
        ...mswHandlers(program),
        http.post('/api/barbershops/:id/loyalty/program', () =>
          HttpResponse.json(
            { success: false, message: 'Não foi possível salvar a configuração de fidelidade.' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Configuração', {}, { timeout: 10000 });
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Salvar' }, { timeout: 10000 })
    );
    await canvas.findByText(
      /Não foi possível salvar a configuração de fidelidade/,
      {},
      { timeout: 10000 }
    );
  },
};
