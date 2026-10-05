import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { userEvent, within } from 'storybook/test';
import { WaitlistPanel } from './WaitlistPanel';
import { StoryProviders } from '../../tests/storyProviders';

const json = (data: unknown) => HttpResponse.json({ success: true, data });

const entries = [
  {
    id: 'w1',
    customerName: 'João Silva',
    whatsapp: '5511999990000',
    serviceId: 'svc-1',
    serviceName: 'Corte social',
    dateFrom: '2026-10-05',
    dateTo: '2026-10-07',
    preferredPeriods: ['MORNING'],
    flexibilityMinutes: 30,
    priority: 0,
    origin: 'STAFF',
    status: 'WAITING',
    validUntil: '2026-10-10',
    createdAt: '2026-10-04T10:00:00.000Z',
  },
  {
    id: 'w2',
    customerName: 'Marcos Prado',
    whatsapp: '5511988880000',
    serviceId: 'svc-2',
    serviceName: 'Barba',
    dateFrom: '2026-10-06',
    dateTo: '2026-10-08',
    preferredPeriods: ['AFTERNOON'],
    flexibilityMinutes: 60,
    priority: 1,
    origin: 'PUBLIC',
    status: 'OFFERED',
    validUntil: '2026-10-11',
    createdAt: '2026-10-04T11:30:00.000Z',
  },
];

const mswHandlers = (rows: unknown[]) => [
  http.get('/api/barbershops/:id/waitlist', () => json(rows)),
];

const meta = {
  title: 'Lista de espera/WaitlistPanel',
  component: WaitlistPanel,
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
    msw: { handlers: mswHandlers(entries) },
  },
} satisfies Meta<typeof WaitlistPanel>;
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
        http.get('/api/barbershops/:id/waitlist', () =>
          HttpResponse.json(
            { success: false, message: 'Não foi possível carregar a lista de espera' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async () => {
    await within(document.body).findByText(
      'Não foi possível carregar a lista de espera',
      {},
      { timeout: 10000 }
    );
  },
};

export const ErroForm: Story = {
  parameters: {
    msw: {
      handlers: [
        ...mswHandlers(entries),
        http.patch('/api/barbershops/:id/waitlist/:entryId', () =>
          HttpResponse.json(
            { success: false, message: 'Não foi possível salvar a entrada' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async () => {
    const body = within(document.body);
    const edit = await body.findAllByRole('button', { name: /Editar/ }, { timeout: 10000 });
    await userEvent.click(edit[0]);
    const save = await body.findByRole('button', { name: 'Salvar' }, { timeout: 10000 });
    await userEvent.click(save);
    await body.findByText('Não foi possível salvar a entrada', {}, { timeout: 10000 });
  },
};
