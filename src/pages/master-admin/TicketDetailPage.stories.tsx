import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useEffect } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { userEvent, within } from 'storybook/test';
import { TicketDetailPage } from './TicketDetailPage';
import { StoryProviders } from '../../tests/storyProviders';
import { authStorage } from '../../infra/authStorage';
import type { Ticket } from '../../infra/adminInternalApi';
import type { StaffMember } from '../../types';

const storyUser: StaffMember = {
  id: 'usr-master-1',
  name: 'Marina Alves',
  email: 'marina@agendai.com.br',
  role: 'MASTER_ADMIN',
  emailVerified: true,
};

const ticket: Ticket = {
  id: 'tkt-1',
  protocol: 'TKT-000123',
  title: 'Falha ao gerar fatura',
  description:
    'O cliente relata erro 500 ao tentar emitir a fatura mensal do plano Essencial.',
  channel: 'WHATSAPP',
  category: 'BILLING',
  priority: 'HIGH',
  status: 'OPEN',
  barbershopId: 'shop-1',
  version: 2,
  createdAt: '2026-09-30T14:20:00.000Z',
  updatedAt: '2026-09-30T14:20:00.000Z',
  resolvedAt: null,
  cancelledAt: null,
  cancelReason: null,
  resolveNote: null,
  createdBy: { id: 'usr-owner-1', name: 'João Pereira' },
  assignedTo: { id: 'usr-support-1', name: 'Rafael Lima' },
  barbershop: { id: 'shop-1', name: 'Barbearia Central' },
  comments: [
    {
      id: 'cmt-1',
      text: 'Cliente notificado sobre a investigação.',
      createdAt: '2026-09-30T15:00:00.000Z',
      author: { id: 'usr-support-1', name: 'Rafael Lima' },
    },
  ],
  history: [
    {
      id: 'hst-1',
      field: 'priority',
      oldValue: 'NORMAL',
      newValue: 'HIGH',
      reason: null,
      createdAt: '2026-09-30T14:30:00.000Z',
      actor: { id: 'usr-support-1', name: 'Rafael Lima' },
    },
  ],
};

const authMe = http.get('/api/auth/me', () => HttpResponse.json({ user: storyUser }));

const getTicketOk = http.get('/api/admin/tickets/:id', () =>
  HttpResponse.json({ success: true, data: ticket })
);

const mswHandlers = [authMe, getTicketOk];

/**
 * Semeia token/usuário MASTER_ADMIN em `sessionStorage` (sem `rememberMe`)
 * antes do AuthProvider montar e limpa tudo ao desmontar: o test-runner usa um
 * único contexto do Playwright, então storage vaza entre stories sem este
 * cleanup.
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
  title: 'MasterAdmin/TicketDetailPage',
  component: TicketDetailPage,
  tags: ['autodocs', 'test'],
  decorators: [
    Story => {
      authStorage.setAccessToken('story-access-token', false);
      authStorage.setUser(storyUser, false);
      return (
        <MemoryRouter initialEntries={['/master/tickets/tkt-1']}>
          <StoryFrame>
            <StoryProviders withAuth>
              <Routes>
                <Route path="/master/tickets/:id" element={<Story />} />
              </Routes>
            </StoryProviders>
          </StoryFrame>
        </MemoryRouter>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers },
  },
} satisfies Meta<typeof TicketDetailPage>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Detalhe do chamado carregado (GET /api/admin/tickets/tkt-1 → success/data). */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Falha ao gerar fatura', {}, { timeout: 10000 });
  },
};

/**
 * Falha ao mudar o status (PATCH /api/admin/tickets/:id → 500): banner de erro
 * `actionError` logo abaixo da barra de ações, sem alterar o status local.
 */
export const ErroAcao: Story = {
  parameters: {
    msw: {
      handlers: [
        ...mswHandlers,
        http.patch('/api/admin/tickets/:id', () =>
          HttpResponse.json(
            { success: false, message: 'Erro ao atualizar status.' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Falha ao gerar fatura', {}, { timeout: 10000 });
    await userEvent.click(
      await canvas.findByRole(
        'button',
        { name: 'Iniciar atendimento' },
        { timeout: 10000 }
      )
    );
    await canvas.findByText(/Erro ao atualizar status/, {}, { timeout: 10000 });
  },
};
