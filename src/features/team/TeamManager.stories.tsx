import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { fn, userEvent, within } from 'storybook/test';
import { TeamManager } from './TeamManager';
import { StoryProviders } from '../../tests/storyProviders';
import { useBarbershop } from '../../contexts/BarbershopContext';
import { authStorage } from '../../infra/authStorage';
import type { StaffMember } from '../../types';

const json = (data: unknown) => HttpResponse.json({ success: true, data });

const storyUser: StaffMember = {
  id: 'usr-1',
  name: 'Caio',
  email: 'caio@agendaja.com.br',
  role: 'OWNER',
  barbershopId: 'shop-1',
  emailVerified: true,
};

/** Forma crua que `GET /api/users?barbershopId=shop-1` devolve (vira `staff` via `mapStaffFromApi`). */
const apiTeam = [
  {
    id: 'usr-1',
    name: 'Caio',
    email: 'caio@agendaja.com.br',
    role: 'OWNER',
    barbershopId: 'shop-1',
    permissions: [],
  },
  {
    id: 'st-2',
    name: 'Bruno Lima',
    email: 'bruno@barbearia.com',
    role: 'EMPLOYEE',
    barbershopId: 'shop-1',
    permissions: ['QUEUE_MANAGE', 'APPOINTMENTS_MANAGE', 'CLIENTS_MANAGE', 'PACKAGES_SELL'],
  },
];

const authMe = http.get('/api/auth/me', () => HttpResponse.json({ user: storyUser }));
const teamOk = http.get('/api/users', () => json(apiTeam));
const shopOk = http.get('/api/barbershops/:id', () =>
  json({ name: 'Barbearia Central', operationMode: 'HYBRID' })
);
const scheduleOk = http.get('/api/barbershops/:id/schedule', () => json([]));
const servicesOk = http.get('/api/services', () => json([]));
const feedOk = http.get('/api/feed', () => json([]));
const baseHandlers = [authMe, teamOk, shopOk, scheduleOk, servicesOk, feedOk];

/** `POST /api/users` (cadastro de membro) → 500. */
const addErro = () =>
  http.post('/api/users', () =>
    HttpResponse.json(
      { success: false, message: 'Não foi possível cadastrar o funcionário.' },
      { status: 500 }
    )
  );

/** `DELETE /api/users/:id` (remoção de membro) → 500. */
const deleteErro = () =>
  http.delete('/api/users/:id', () =>
    HttpResponse.json(
      { success: false, message: 'Não foi possível remover o membro.' },
      { status: 500 }
    )
  );

/**
 * Espelha o wiring do `StaffDashboard`: `staff` e `onUpdateTeam` vêm do
 * `BarbershopContext`, então o persist é o `updateTeam` real
 * (`addStaff`/`deleteStaff` → `POST`/`DELETE /api/users`).
 */
const TeamHarness: React.FC = () => {
  const { staff, loading, updateTeam } = useBarbershop();
  if (loading) {
    return <div className="p-6 text-sm text-text-secondary">Carregando equipe…</div>;
  }
  return (
    <TeamManager
      staff={staff}
      onUpdateTeam={async team => {
        await updateTeam(team);
      }}
      currentAdminId={storyUser.id}
    />
  );
};

/**
 * Semeia token/usuário em `sessionStorage` antes do AuthProvider montar e limpa
 * tudo ao desmontar: o test-runner usa um único contexto do Playwright, então o
 * storage vaza entre stories sem este cleanup.
 */
const StoryFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(
    () => () => {
      authStorage.clearTokens();
      authStorage.clearUser();
    },
    []
  );
  return <>{children}</>;
};

const meta = {
  title: 'Equipe/TeamManager',
  component: TeamManager,
  tags: ['autodocs', 'test'],
  render: () => <TeamHarness />,
  // A story renderiza via `render` (harness do contexto); os args satisfazem o
  // contrato de props do componente e documentam a API pública.
  args: {
    staff: [],
    onUpdateTeam: fn(),
    currentAdminId: storyUser.id,
  },
  decorators: [
    Story => {
      authStorage.setAccessToken('story-access-token', false);
      authStorage.setUser(storyUser, false);
      return (
        <MemoryRouter>
          <StoryFrame>
            <StoryProviders withBarbershop>
              <Story />
            </StoryProviders>
          </StoryFrame>
        </MemoryRouter>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: baseHandlers },
  },
} satisfies Meta<typeof TeamManager>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Lista carregada pelo contexto (dono + 1 funcionário), sem erro. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Equipe & Acessos', {}, { timeout: 10000 });
    await canvas.findByText('Bruno Lima', {}, { timeout: 10000 });
  },
};

/**
 * Falha do cadastro (POST /api/users → 500): modal "Novo Membro" aberto com o
 * banner de erro DENTRO do formulário (TeamManager L174).
 */
export const ErroForm: Story = {
  parameters: { msw: { handlers: [...baseHandlers, addErro()] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Equipe & Acessos', {}, { timeout: 10000 });
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Adicionar' }, { timeout: 10000 })
    );
    await canvas.findByText('Novo Membro', {}, { timeout: 10000 });
    await userEvent.type(
      await canvas.findByLabelText('Nome', {}, { timeout: 10000 }),
      'Carlos Souza'
    );
    await userEvent.type(
      await canvas.findByLabelText('E-mail', {}, { timeout: 10000 }),
      'carlos@exemplo.com'
    );
    await userEvent.type(await canvas.findByLabelText('CPF', {}, { timeout: 10000 }), '52998224725');
    await userEvent.type(
      await canvas.findByLabelText('Senha', {}, { timeout: 10000 }),
      'senha123'
    );
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Cadastrar' }, { timeout: 10000 })
    );
    await canvas.findByText(/Não foi possível cadastrar/, {}, { timeout: 10000 });
  },
};

/**
 * Falha da remoção (DELETE /api/users/:id → 500): modal FECHADO, banner de
 * erro fora do formulário (TeamManager L161) — `formError` fica setado com
 * `isAdding === false` pelo catch do `confirmDelete`.
 */
export const ErroLista: Story = {
  parameters: { msw: { handlers: [...baseHandlers, deleteErro()] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Equipe & Acessos', {}, { timeout: 10000 });
    await canvas.findByText('Bruno Lima', {}, { timeout: 10000 });
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Excluir membro' }, { timeout: 10000 })
    );
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Confirmar exclusão' }, { timeout: 10000 })
    );
    await canvas.findByText(/Não foi possível remover/, {}, { timeout: 10000 });
  },
};
