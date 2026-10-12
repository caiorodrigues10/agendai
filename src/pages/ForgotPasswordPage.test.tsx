/// <reference types="vitest/globals" />
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

function resetForgotPasswordMocks() {
  forgotPasswordMock.mockReset();
  forgotPasswordMock.mockResolvedValue({ message: 'ok' });
  getRecaptchaTokenMock.mockReset();
  getRecaptchaTokenMock.mockResolvedValue('recaptcha-token');
  navigateMock.mockReset();
}

const submitButton = () =>
  screen.getByRole('button', { name: /enviar instruções|enviar/i });

const fillEmail = (value: string) => {
  fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value } });
};

describe('ForgotPasswordPage (recuperação de senha)', () => {
  beforeEach(resetForgotPasswordMocks);

  it('renderiza o campo de e-mail e mantém o envio desabilitado sem e-mail válido', () => {
    renderWithProviders(<ForgotPasswordPage />, { route: '/esqueci-minha-senha' });

    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(submitButton()).toBeDisabled();

    fillEmail('nao-e-email');
    expect(submitButton()).toBeDisabled();
    expect(forgotPasswordMock).not.toHaveBeenCalled();
  });

  it('com e-mail válido envia o token do recaptcha e o e-mail aparado', async () => {
    renderWithProviders(<ForgotPasswordPage />, { route: '/esqueci-minha-senha' });

    fillEmail('  caio@example.com  ');
    expect(submitButton()).toBeEnabled();

    fireEvent.click(submitButton());

    await waitFor(() => {
      expect(getRecaptchaTokenMock).toHaveBeenCalledWith('forgot_password');
      expect(forgotPasswordMock).toHaveBeenCalledWith('caio@example.com', 'recaptcha-token');
    });
  });

  it('mostra a tela de confirmação sem revelar se a conta existe', async () => {
    renderWithProviders(<ForgotPasswordPage />, { route: '/esqueci-minha-senha' });

    fillEmail('caio@example.com');
    fireEvent.click(submitButton());

    await waitFor(() => {
      expect(screen.getByText(/verifique sua caixa de entrada/i)).toBeInTheDocument();
    });
    expect(screen.getByText('caio@example.com')).toBeInTheDocument();
    expect(screen.queryByText(/senha inválida|não encontrada|erro/i)).not.toBeInTheDocument();
  });

  it('mesmo quando a API falha mostra a mesma tela de sucesso (sem enumeração de contas)', async () => {
    forgotPasswordMock.mockRejectedValue(new Error('usuário não encontrado'));

    renderWithProviders(<ForgotPasswordPage />, { route: '/esqueci-minha-senha' });

    fillEmail('inexistente@example.com');
    fireEvent.click(submitButton());

    await waitFor(() => {
      expect(screen.getByText(/verifique sua caixa de entrada/i)).toBeInTheDocument();
    });
    expect(screen.getByText('inexistente@example.com')).toBeInTheDocument();
    expect(screen.queryByText(/usuário não encontrado/i)).not.toBeInTheDocument();
  });

  it('"Voltar ao login" leva de volta para /login', async () => {
    renderWithProviders(<ForgotPasswordPage />, { route: '/esqueci-minha-senha' });

    fillEmail('caio@example.com');
    fireEvent.click(submitButton());
    await waitFor(() => {
      expect(screen.getByText(/verifique sua caixa de entrada/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /voltar ao login/i }));
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });
});
