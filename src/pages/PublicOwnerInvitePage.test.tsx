/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PublicOwnerInvitePage } from './PublicOwnerInvitePage';
import { authApi } from '../infra/authApi';

vi.mock('../infra/authApi', () => ({
  authApi: { acceptInvite: vi.fn() },
}));

const acceptInvite = vi.mocked(authApi.acceptInvite);
const VALID_TOKEN = 'a'.repeat(64);

function renderPage(token?: string) {
  return render(
    <MemoryRouter initialEntries={[token ? `/convite/${token}` : '/convite/']}>
      <Routes>
        <Route path="/convite/:token" element={<PublicOwnerInvitePage />} />
        <Route path="/login" element={<div>pagina-login</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PublicOwnerInvitePage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mostra link inválido quando o token está ausente ou curto', async () => {
    renderPage('abc');
    expect(await screen.findByText('Link inválido')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Ir para o login/ }));
    expect(await screen.findByText('pagina-login')).toBeInTheDocument();
  });

  it('define a senha com sucesso e mostra a tela de confirmação', async () => {
    acceptInvite.mockResolvedValue({ success: true, message: 'Senha definida com sucesso' } as never);
    renderPage(VALID_TOKEN);

    fireEvent.change(screen.getByLabelText(/^Nova senha/), { target: { value: 'NovaSenha123' } });
    fireEvent.change(screen.getByLabelText(/Confirmar nova senha/), {
      target: { value: 'NovaSenha123' },
    });

    const submit = screen.getByRole('button', { name: /Definir senha/ });
    await waitFor(() => expect(submit).toBeEnabled());
    fireEvent.click(submit);

    await waitFor(() =>
      expect(acceptInvite).toHaveBeenCalledWith(VALID_TOKEN, 'NovaSenha123'),
    );
    expect(await screen.findByText('Senha definida com sucesso!')).toBeInTheDocument();
  });

  it('exibe a mensagem genérica do backend quando o convite é inválido', async () => {
    acceptInvite.mockRejectedValue({
      message: 'Link inválido ou expirado. Solicite um novo convite.',
    });
    renderPage(VALID_TOKEN);

    fireEvent.change(screen.getByLabelText(/^Nova senha/), { target: { value: 'NovaSenha123' } });
    fireEvent.change(screen.getByLabelText(/Confirmar nova senha/), {
      target: { value: 'NovaSenha123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Definir senha/ }));

    expect(
      await screen.findByText('Link inválido ou expirado. Solicite um novo convite.'),
    ).toBeInTheDocument();
  });

  it('mantém o submit desativado com senha fraca ou senhas diferentes', async () => {
    renderPage(VALID_TOKEN);

    const submit = screen.getByRole('button', { name: /Definir senha/ });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/^Nova senha/), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText(/Confirmar nova senha/), { target: { value: '123456' } });
    // só números: não passa na regra letras+números
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/^Nova senha/), { target: { value: 'NovaSenha123' } });
    fireEvent.change(screen.getByLabelText(/Confirmar nova senha/), {
      target: { value: 'NovaSenha12' },
    });
    expect(submit).toBeDisabled();
    expect(
      screen.getByText('As senhas não coincidem'),
    ).toBeInTheDocument();
    expect(acceptInvite).not.toHaveBeenCalled();
  });
});
