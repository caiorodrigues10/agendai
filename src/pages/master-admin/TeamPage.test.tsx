/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeamPage } from './TeamPage';
import { adminInternalApi, type Invitation } from '../../infra/adminInternalApi';

vi.mock('../../infra/adminInternalApi', () => ({
  adminInternalApi: {
    listTeam: vi.fn(),
    inviteTeamMember: vi.fn(),
    resendInvitation: vi.fn(),
    revokeInvitation: vi.fn(),
    deactivateMember: vi.fn(),
    reactivateMember: vi.fn(),
  },
}));

const listTeam = vi.mocked(adminInternalApi.listTeam);
const inviteTeamMember = vi.mocked(adminInternalApi.inviteTeamMember);

describe('TeamPage — convite de funcionário interno', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listTeam.mockResolvedValue({ success: true, users: [], invitations: [], meta: { total: 0 } });
    inviteTeamMember.mockResolvedValue({ success: true, data: {} as Invitation });
  });

  it('dá nome acessível ao botão só-ícone de atualizar a lista', async () => {
    render(<TeamPage />);
    await screen.findByRole('heading', { name: 'Equipe Agenda Já' });

    expect(screen.getByRole('button', { name: 'Atualizar' })).toBeInTheDocument();
  });

  it('valida o e-mail com zod antes de chamar a API', async () => {
    render(<TeamPage />);
    await screen.findByRole('heading', { name: 'Equipe Agenda Já' });

    fireEvent.change(screen.getByPlaceholderText('E-mail do convidado'), {
      target: { value: 'nao-e-email' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Enviar convite/ }));

    expect(await screen.findByText('Informe um e-mail válido.')).toBeInTheDocument();
    expect(inviteTeamMember).not.toHaveBeenCalled();
  });

  it('exige o e-mail e envia junto com o perfil selecionado', async () => {
    render(<TeamPage />);
    await screen.findByRole('heading', { name: 'Equipe Agenda Já' });

    fireEvent.click(screen.getByRole('button', { name: /Enviar convite/ }));
    expect(await screen.findByText('Informe o e-mail.')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('E-mail do convidado'), {
      target: { value: 'novo@agendai.local' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Suporte/ }));
    fireEvent.click(screen.getByRole('button', { name: /Enviar convite/ }));

    await waitFor(() =>
      expect(inviteTeamMember).toHaveBeenCalledWith('novo@agendai.local', 'SUPPORT'),
    );
    expect(await screen.findByText('Convite enviado.')).toBeInTheDocument();
  });
});
