/// <reference types="vitest/globals" />
/**
 * ForgotPasswordPage — comportamento em FALHA (429, 503, rede, recaptcha).
 *
 * O objetivo é registrar o que o usuário vê quando o back recusa: o código
 * atual engole o erro da API e sempre mostra "E-mail enviado".
 */
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { renderWithProviders } from '../tests/testUtils';

const forgotPasswordMock = vi.hoisted(() => vi.fn());
const getRecaptchaTokenMock = vi.hoisted(() => vi.fn());
const navigateMock = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('../infra/authApi', () => ({
  authApi: { forgotPassword: forgotPasswordMock },
}));

vi.mock('../utils/recaptcha', () => ({
  getRecaptchaToken: getRecaptchaTokenMock,
}));

function apiError(statusCode: number, message: string) {
  const err = new Error(message);
  err.name = 'ApiError';
  (err as unknown as { statusCode: number }).statusCode = statusCode;
  return err;
}

const submitButton = () =>
  screen.getByRole('button', { name: /enviar instruções|enviar/i });

const fillEmail = (value: string) => {
  fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value } });
};

beforeEach(() => {
  forgotPasswordMock.mockReset();
  getRecaptchaTokenMock.mockReset();
  getRecaptchaTokenMock.mockResolvedValue('recaptcha-token');
  navigateMock.mockReset();
});

describe('ForgotPasswordPage — falhas da API', () => {
  it('429 (rate limit) → ainda mostra "E-mail enviado" [GAP]', async () => {
    forgotPasswordMock.mockRejectedValue(
      apiError(429, 'Muitas solicitações. Tente novamente em 1 hora.'),
    );

    renderWithProviders(<ForgotPasswordPage />, { route: '/esqueci-senha' });
    fillEmail('usuario@example.com');
    fireEvent.click(submitButton());

    await waitFor(() => {
      expect(screen.getByText(/verifique sua caixa de entrada/i)).toBeInTheDocument();
    });
    // Nenhuma menção a "muitas solicitações"/"aguarde".
    expect(screen.queryByText(/muitas solicitações|tente novamente em/i)).not.toBeInTheDocument();
  });

  it('503 (Redis/recaptcha fora) → ainda mostra "E-mail enviado" [GAP]', async () => {
    forgotPasswordMock.mockRejectedValue(
      apiError(503, 'Serviço temporariamente indisponível. Tente novamente em instantes.'),
    );

    renderWithProviders(<ForgotPasswordPage />, { route: '/esqueci-senha' });
    fillEmail('usuario@example.com');
    fireEvent.click(submitButton());

    await waitFor(() => {
      expect(screen.getByText(/verifique sua caixa de entrada/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/indisponível|temporariamente/i)).not.toBeInTheDocument();
  });

  it('rede caída → ainda mostra "E-mail enviado" [GAP]', async () => {
    forgotPasswordMock.mockRejectedValue(new TypeError('Failed to fetch'));

    renderWithProviders(<ForgotPasswordPage />, { route: '/esqueci-senha' });
    fillEmail('usuario@example.com');
    fireEvent.click(submitButton());

    await waitFor(() => {
      expect(screen.getByText(/verifique sua caixa de entrada/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/não foi possível|tente novamente/i)).not.toBeInTheDocument();
  });

  it('falha do recaptcha MOSTRA erro (único caso tratado) e mantém o e-mail digitado', async () => {
    getRecaptchaTokenMock.mockRejectedValue(new Error('reCAPTCHA indisponível'));

    renderWithProviders(<ForgotPasswordPage />, { route: '/esqueci-senha' });
    fillEmail('usuario@example.com');
    fireEvent.click(submitButton());

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/reCAPTCHA indisponível/i);
    });
    // O e-mail digitado é preservado no erro.
    expect(screen.getByLabelText(/e-mail/i)).toHaveValue('usuario@example.com');
    expect(forgotPasswordMock).not.toHaveBeenCalled();
  });

  it('não há botão de reenviar/cooldown na tela de sucesso (só "Voltar ao login")', async () => {
    forgotPasswordMock.mockResolvedValue({ message: 'ok' });

    renderWithProviders(<ForgotPasswordPage />, { route: '/esqueci-senha' });
    fillEmail('usuario@example.com');
    fireEvent.click(submitButton());

    await waitFor(() => {
      expect(screen.getByText(/verifique sua caixa de entrada/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /voltar ao login/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reenviar|novo e-mail/i })).not.toBeInTheDocument();
  });

  it('mantém o e-mail no formulário quando a API falha antes do sucesso (erro do recaptcha)', async () => {
    getRecaptchaTokenMock.mockRejectedValueOnce(new Error('boom'));

    renderWithProviders(<ForgotPasswordPage />, { route: '/esqueci-senha' });
    fillEmail('mantido@example.com');
    fireEvent.click(submitButton());

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect((screen.getByLabelText(/e-mail/i) as HTMLInputElement).value).toBe(
      'mantido@example.com',
    );
  });
});
