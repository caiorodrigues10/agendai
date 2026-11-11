/// <reference types="vitest/globals" />
/**
 * ForgotPasswordPage — comportamento em FALHA (429, 503, rede, recaptcha).
 *
 * O back responde 200 genérico para e-mail inexistente (anti-enumeração);
 * qualquer erro aqui é infra/rate-limit/recaptcha e precisa ficar VISÍVEL —
 * nunca a tela de "E-mail enviado".
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
  it('429 (rate limit) → mostra o erro e NÃO a tela de "E-mail enviado"', async () => {
    forgotPasswordMock.mockRejectedValue(
      apiError(429, 'Muitas solicitações. Tente novamente em 1 hora.'),
    );

    renderWithProviders(<ForgotPasswordPage />, { route: '/esqueci-senha' });
    fillEmail('usuario@example.com');
    fireEvent.click(submitButton());

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/muitas solicitações/i);
    });
    expect(screen.queryByText(/verifique sua caixa de entrada/i)).not.toBeInTheDocument();
  });

  it('503 (Redis/recaptcha fora) → mostra o erro e NÃO a tela de sucesso', async () => {
    forgotPasswordMock.mockRejectedValue(
      apiError(503, 'Serviço temporariamente indisponível. Tente novamente em instantes.'),
    );

    renderWithProviders(<ForgotPasswordPage />, { route: '/esqueci-senha' });
    fillEmail('usuario@example.com');
    fireEvent.click(submitButton());

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/indisponível|temporariamente/i);
    });
    expect(screen.queryByText(/verifique sua caixa de entrada/i)).not.toBeInTheDocument();
  });

  it('rede caída → mostra erro de conexão e NÃO a tela de sucesso', async () => {
    forgotPasswordMock.mockRejectedValue(new TypeError('Failed to fetch'));

    renderWithProviders(<ForgotPasswordPage />, { route: '/esqueci-senha' });
    fillEmail('usuario@example.com');
    fireEvent.click(submitButton());

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/não foi possível conectar/i);
    });
    expect(screen.queryByText(/verifique sua caixa de entrada/i)).not.toBeInTheDocument();
  });

  it('falha do recaptcha MOSTRA erro e mantém o e-mail digitado', async () => {
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
