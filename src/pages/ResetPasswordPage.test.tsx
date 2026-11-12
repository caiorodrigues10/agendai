/// <reference types="vitest/globals" />
/**
 * ResetPasswordPage — token na URL, validações, estados de erro e sucesso.
 *
 * Comportamentos cobertos (pós-correção):
 * - o `?token=` é capturado na montagem e removido da URL (replace);
 * - o submit só habilita com token >= 32 caracteres (Zod do back);
 * - falha da API mostra a mensagem do back no banner (role=alert);
 * - sucesso redireciona para /login em 3s (com cleanup do timer).
 */
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { ResetPasswordPage } from './ResetPasswordPage';
import { renderWithProviders } from '../tests/testUtils';

const resetPasswordMock = vi.hoisted(() => vi.fn());
const navigateMock = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    // Mantém useSearchParams/useLocation reais (MemoryRouter).
  };
});

vi.mock('../infra/authApi', () => ({
  authApi: { resetPassword: resetPasswordMock },
}));

const TOKEN = 'a1b2'.repeat(16);

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
}

const newPasswordInput = () =>
  screen.getByLabelText('Nova senha', { selector: 'input' }) as HTMLInputElement;
const confirmInput = () =>
  screen.getByLabelText('Confirmar nova senha', { selector: 'input' }) as HTMLInputElement;
const submitButton = () => screen.getByRole('button', { name: /redefinir senha/i });

function fillPasswords(newPassword: string, confirm = newPassword) {
  fireEvent.change(newPasswordInput(), { target: { value: newPassword } });
  fireEvent.change(confirmInput(), { target: { value: confirm } });
}

beforeEach(() => {
  resetPasswordMock.mockReset();
  resetPasswordMock.mockResolvedValue({ message: 'Senha redefinida com sucesso' });
  navigateMock.mockReset();
  vi.useRealTimers();
});

describe('ResetPasswordPage — token e validação', () => {
  it('sem token na URL mostra "Link inválido" e aponta para /esqueci-senha', () => {
    renderWithProviders(
      <>
        <ResetPasswordPage />
        <LocationProbe />
      </>,
      { route: '/reset-password' },
    );

    expect(screen.getByText(/link inválido/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /solicitar novo link/i }));
    expect(navigateMock).toHaveBeenCalledWith('/esqueci-senha');
  });

  it('token é capturado na montagem e removido da URL (replace)', async () => {
    renderWithProviders(
      <>
        <ResetPasswordPage />
        <LocationProbe />
      </>,
      { route: `/reset-password?token=${TOKEN}` },
    );

    // A URL do router fica limpa — o token só segue em memória (estado).
    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/reset-password');
    });
    expect(screen.getByTestId('location')).not.toHaveTextContent('token=');

    // O token capturado continua funcional: o form habilita e o submit usa ele.
    fillPasswords('NovaSenha456');
    expect(submitButton()).toBeEnabled();
    fireEvent.click(submitButton());
    await waitFor(() => expect(resetPasswordMock).toHaveBeenCalledWith(TOKEN, 'NovaSenha456'));
  });

  it('token com 11..31 caracteres mantém o envio DESABILITADO (back exige >=32)', () => {
    renderWithProviders(<ResetPasswordPage />, {
      route: '/reset-password?token=curto1234567890',
    });
    fillPasswords('NovaSenha456');
    // 14 caracteres < 32 → o front nem envia (antes o back respondia 400).
    expect(submitButton()).toBeDisabled();
  });

  it('senha com menos de 6 caracteres mantém o envio desabilitado', () => {
    renderWithProviders(<ResetPasswordPage />, {
      route: `/reset-password?token=${TOKEN}`,
    });
    fillPasswords('12345');
    expect(submitButton()).toBeDisabled();
  });

  it('senha com 6 ou 7 caracteres mantém o envio desabilitado (mínimo 8)', () => {
    renderWithProviders(<ResetPasswordPage />, {
      route: `/reset-password?token=${TOKEN}`,
    });

    // 6 caracteres com letra e número: antes bastava, agora não.
    fillPasswords('Senha12');
    expect(submitButton()).toBeDisabled();

    // 7 caracteres com letra e número: ainda abaixo do mínimo.
    fillPasswords(`Senh${123}`);
    expect(submitButton()).toBeDisabled();

    // 8 caracteres com letra e número: válido.
    fillPasswords('Senha123');
    expect(submitButton()).toBeEnabled();
  });

  it('senhas diferentes mostram erro e desabilitam o envio', () => {
    renderWithProviders(<ResetPasswordPage />, {
      route: `/reset-password?token=${TOKEN}`,
    });
    fillPasswords('NovaSenha456', 'OutraSenha789');

    expect(screen.getByText(/as senhas não coincidem/i)).toBeInTheDocument();
    expect(submitButton()).toBeDisabled();
  });
});

describe('ResetPasswordPage — acessibilidade e gerenciador de senhas', () => {
  it('usa autocomplete="new-password" nos dois campos e não expõe campo de usuário', () => {
    renderWithProviders(<ResetPasswordPage />, {
      route: `/reset-password?token=${TOKEN}`,
    });

    expect(newPasswordInput()).toHaveAttribute('autocomplete', 'new-password');
    expect(confirmInput()).toHaveAttribute('autocomplete', 'new-password');
    expect(screen.queryByLabelText(/usuário|login|e-mail/i)).not.toBeInTheDocument();
    expect(document.querySelector('input[type="text"][name*="user"]')).toBeNull();
  });

  it('botões de mostrar/ocultar senha têm aria-label e aria-pressed', () => {
    renderWithProviders(<ResetPasswordPage />, {
      route: `/reset-password?token=${TOKEN}`,
    });
    const toggle = screen.getAllByRole('button', { name: /mostrar senha/i })[0];
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(toggle);
    const hide = screen.getAllByRole('button', { name: /ocultar senha/i })[0];
    expect(hide).toHaveAttribute('aria-pressed', 'true');
    expect(newPasswordInput()).toHaveAttribute('type', 'text');
  });

  it('mensagem de erro da API é anunciada (role=alert)', async () => {
    resetPasswordMock.mockRejectedValue(new Error('Token já utilizado'));

    renderWithProviders(<ResetPasswordPage />, {
      route: `/reset-password?token=${TOKEN}`,
    });
    fillPasswords('NovaSenha456');
    fireEvent.click(submitButton());

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/token já utilizado/i);
    });
  });
});

describe('ResetPasswordPage — estados da API', () => {
  it('token inválido/expirado devolve a mensagem do back', async () => {
    resetPasswordMock.mockRejectedValue(
      new Error('Token expirado. Solicite uma nova redefinição.'),
    );

    renderWithProviders(<ResetPasswordPage />, {
      route: `/reset-password?token=${TOKEN}`,
    });
    fillPasswords('NovaSenha456');
    fireEvent.click(submitButton());

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /token expirado\. solicite uma nova redefinição\./i,
      );
    });
  });

  it('sucesso mostra a tela de confirmação e avisa que o login é necessário em seguida', async () => {
    renderWithProviders(<ResetPasswordPage />, {
      route: `/reset-password?token=${TOKEN}`,
    });
    fillPasswords('NovaSenha456');
    fireEvent.click(submitButton());

    await waitFor(() => {
      expect(screen.getByText(/senha alterada com sucesso/i)).toBeInTheDocument();
    });
    // Avisa o usuário sobre o redirecionamento.
    expect(screen.getByText(/redirecionado para a tela de login/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /ir para o login/i }),
    ).toBeInTheDocument();

    // Redireciona em 3s (tempo real) para /login.
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/login');
    }, { timeout: 4000 });
  });

  it('token já usado: clicar de novo no link mostra o erro do back no formulário', async () => {
    resetPasswordMock.mockRejectedValue(new Error('Token já utilizado'));

    renderWithProviders(<ResetPasswordPage />, {
      route: `/reset-password?token=${TOKEN}`,
    });
    fillPasswords('NovaSenha456');
    fireEvent.click(submitButton());

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/token já utilizado/i);
    });
    // Continua na página do formulário (sem tela de sucesso).
    expect(screen.queryByText(/senha alterada com sucesso/i)).not.toBeInTheDocument();
  });
});
