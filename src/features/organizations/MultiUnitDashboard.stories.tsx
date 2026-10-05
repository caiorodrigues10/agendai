import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { userEvent, within } from 'storybook/test';
import { MultiUnitDashboard } from './MultiUnitDashboard';
import { StoryProviders } from '../../tests/storyProviders';
import { OrganizationDashboardShop } from '../../infra/organizationsApi';
import type { StaffMember } from '../../types';

const storyUser: StaffMember = {
  id: 'usr-1',
  name: 'Caio',
  email: 'caio@agendaja.com.br',
  role: 'OWNER',
  barbershopId: 'shop-1',
  emailVerified: true,
};

const shops: OrganizationDashboardShop[] = [
  {
    barbershopId: 'shop-1',
    name: 'Barbearia Central',
    logoUrl: null,
    isOpen: true,
    accessLevel: 'FULL',
    liveNow: 4,
    waitingCount: 3,
    inServiceCount: 1,
    revenue: { today: 450, week: 2100, month: 8400 },
  },
  {
    barbershopId: 'shop-2',
    name: 'Estúdio Norte',
    logoUrl: null,
    isOpen: false,
    accessLevel: 'OPERATIONAL',
    liveNow: 1,
    waitingCount: 1,
    inServiceCount: 0,
  },
];

const json = (data: unknown) => HttpResponse.json({ success: true, data });

const authMe = http.get('/api/auth/me', () => HttpResponse.json({ user: storyUser }));
const dashboardOk = http.get('/api/organizations/:id/dashboard', () => json(shops));

const mswHandlers = [authMe, dashboardOk];

const meta = {
  title: 'Organizações/MultiUnitDashboard',
  component: MultiUnitDashboard,
  tags: ['autodocs', 'test'],
  args: { orgId: 'org-1' },
  decorators: [
    Story => (
      <MemoryRouter>
        <StoryProviders withAuth>
          <Story />
        </StoryProviders>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers },
  },
} satisfies Meta<typeof MultiUnitDashboard>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Espera os dois cards de salão carregados antes do capture. */
const waitForShops = async (canvas: ReturnType<typeof within>) => {
  await canvas.findByText('Barbearia Central', {}, { timeout: 10000 });
  await canvas.findByText('Estúdio Norte', {}, { timeout: 10000 });
};

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await waitForShops(within(canvasElement));
  },
};

/** Falha do load (GET dashboard → 500): card de erro com retry. */
export const Erro: Story = {
  parameters: {
    msw: {
      handlers: [
        authMe,
        http.get('/api/organizations/:id/dashboard', () =>
          HttpResponse.json(
            {
              success: false,
              message: 'Não foi possível carregar os salões desta organização.',
            },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(
      'Não foi possível carregar os salões desta organização.',
      {},
      { timeout: 10000 }
    );
  },
};

/**
 * Falha do desanexo (DELETE /:orgId/barbershops/:barbershopId → 500): banner
 * entre o cabeçalho e a grade de cards.
 */
export const ErroDesanexar: Story = {
  parameters: {
    msw: {
      handlers: [
        ...mswHandlers,
        http.delete('/api/organizations/:id/barbershops/:barbershopId', () =>
          HttpResponse.json(
            { success: false, message: 'Não foi possível desanexar o salão.' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitForShops(canvas);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Desanexar Estúdio Norte' }, { timeout: 10000 })
    );
    const body = within(document.body);
    const dialog = await body.findByRole('alertdialog', {}, { timeout: 10000 });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Desanexar' }));
    await canvas.findByText(/Não foi possível desanexar o salão/, {}, { timeout: 10000 });
  },
};
