import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { RecommendationsPanel } from './RecommendationsPanel';
import { StoryProviders } from '../../tests/storyProviders';

const json = (data: unknown) => HttpResponse.json({ success: true, data });

const recommendations = [
  {
    id: 'r1',
    type: 'CLIENT_OVERDUE',
    title: '12 clientes sem visita há 60 dias',
    reason: 'Histórico indica recorrência média de 45 dias.',
    impact: 'Recuperar cerca de R$ 780 no mês.',
    suggestedAction: 'Disparar mensagem de reativação com 10% de desconto.',
    priority: 'high',
    metadata: {},
  },
  {
    id: 'r2',
    type: 'LOW_OCCASSION_TOMORROW',
    title: 'Amanhã deve ter baixa demanda',
    reason: 'Chuva forte prevista e agenda pouco cheia.',
    impact: 'Reduzir equipe de 4 para 2 profissionais.',
    suggestedAction: 'Antecipar horários de almoço da equipe.',
    priority: 'medium',
    metadata: {},
  },
];

const mswHandlers = (rows: unknown[]) => [
  http.get('/api/barbershops/:id/analytics/recommendations', () => json(rows)),
];

const meta = {
  title: 'Recomendações/RecommendationsPanel',
  component: RecommendationsPanel,
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
    msw: { handlers: mswHandlers(recommendations) },
  },
} satisfies Meta<typeof RecommendationsPanel>;
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
        http.get('/api/barbershops/:id/analytics/recommendations', () =>
          HttpResponse.json({ success: false, message: 'Erro ao carregar recomendações' }, { status: 500 })
        ),
      ],
    },
  },
};
