import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { userEvent, within } from 'storybook/test';
import { OrganizationsPanel } from './OrganizationsPanel';
import { StoryProviders } from '../../tests/storyProviders';
import { Organization } from '../../infra/organizationsApi';
import type { StaffMember } from '../../types';

const storyUser: StaffMember = {
  id: 'usr-1',
  name: 'Caio',
  email: 'caio@agendaja.com.br',
  role: 'OWNER',
  barbershopId: 'shop-1',
  emailVerified: true,
};

const orgs: Organization[] = [
  {
    id: 'org-1',
    name: 'Grupo Aurora',
    slug: 'grupo-aurora',
    barbershops: [{ id: 'shop-1', name: 'Barbearia Central' }],
    members: [
      { id: 'mem-1', userId: 'usr-1', role: 'OWNER', user: { name: 'Caio', email: 'caio@agendaja.com.br' } },
    ],
  },
  { id: 'org-2', name: 'Rede Solar', slug: 'rede-solar', barbershops: [], members: [] },
];

const json = (data: unknown) => HttpResponse.json({ success: true, data });

const authMe = http.get('/api/auth/me', () => HttpResponse.json({ user: storyUser }));
const listOk = http.get('/api/organizations', () => json(orgs));
const dashboardOk = http.get('/api/organizations/:id/dashboard', () => json([]));

const mswHandlers = [authMe, listOk, dashboardOk];

const meta = {
  title: 'Organizações/OrganizationsPanel',
  component: OrganizationsPanel,
  tags: ['autodocs', 'test'],
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
} satisfies Meta<typeof OrganizationsPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Espera a lista carregada antes do capture. */
const waitForList = async (canvas: ReturnType<typeof within>) => {
  await canvas.findByText('Grupo Aurora', {}, { timeout: 10000 });
  await canvas.findByText('Rede Solar', {}, { timeout: 10000 });
};

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await waitForList(within(canvasElement));
  },
};

/** Falha do load (GET /api/organizations → 500): card de erro com retry. */
export const Erro: Story = {
  parameters: {
    msw: {
      handlers: [
        authMe,
        http.get('/api/organizations', () =>
          HttpResponse.json(
            { success: false, message: 'Não foi possível carregar as organizações.' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(
      'Não foi possível carregar as organizações.',
      {},
      { timeout: 10000 }
    );
  },
};

/** Falha da exclusão (DELETE /api/organizations/:id → 500): banner no topo do painel. */
export const ErroExcluir: Story = {
  parameters: {
    msw: {
      handlers: [
        ...mswHandlers,
        http.delete('/api/organizations/:id', () =>
          HttpResponse.json(
            { success: false, message: 'Não foi possível excluir a organização.' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitForList(canvas);
    await userEvent.click(
      await canvas.findByRole('button', { name: /Grupo Aurora/ }, { timeout: 10000 })
    );
    await canvas.findByText('Nenhum salão nesta organização ainda.', {}, { timeout: 10000 });
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Excluir organização' }, { timeout: 10000 })
    );
    const body = within(document.body);
    const dialog = await body.findByRole('alertdialog', {}, { timeout: 10000 });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Excluir' }));
    await canvas.findByText(/Não foi possível excluir a organização/, {}, { timeout: 10000 });
  },
};
