/**
 * ITEM 1 — contrato da página de recuperação de senha:
 * falha de reCAPTCHA mostra ERRO e não envia (antes: qualquer exceção virava
 * tela de sucesso e o envio seguia sem token quando `getRecaptchaToken`
 * devolvia "" em falha).
 */
import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './testUtils';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';

const forgotPassword = vi.fn();

vi.mock('../infra/authApi', () => ({
  authApi: {
    forgotPassword: (...args: unknown[]) => forgotPassword(...args),
  },
}));

vi.mock('../utils/recaptcha', async importOriginal => {
  const actual = await importOriginal<typeof import('../utils/recaptcha')>();
  return { ...actual, getRecaptchaToken: vi.fn() };
});

async function loadPage() {
  const { getRecaptchaToken, RECAPTCHA_ERROR_MESSAGE } = await import('../utils/recaptcha');
  renderWithProviders(<ForgotPasswordPage />, { route: '/recuperar-senha' });
  return { getRecaptchaToken: getRecaptchaToken as ReturnType<typeof vi.fn>, RECAPTCHA_ERROR_MESSAGE };
}

async function submitEmail(email = 'dono@salao.com') {
  const input = await screen.findByPlaceholderText('seu@email.com');
  fireEvent.change(input, { target: { value: email } });
  fireEvent.click(screen.getByRole('button', { name: /enviar instruções/i }));
}

describe('ForgotPasswordPage — token reCAPTCHA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('falha do getRecaptchaToken mostra erro e NÃO chama a API (falha antes: mostrava sucesso)', async () => {
    const { getRecaptchaToken, RECAPTCHA_ERROR_MESSAGE } = await loadPage();
    getRecaptchaToken.mockRejectedValue(new Error(RECAPTCHA_ERROR_MESSAGE));

    await submitEmail();

    expect(await screen.findByText(RECAPTCHA_ERROR_MESSAGE)).toBeInTheDocument();
    expect(forgotPassword).not.toHaveBeenCalled();
    expect(screen.queryByText(/verifique sua caixa de entrada/i)).not.toBeInTheDocument();
  });

  it('token ok + API falha → tela de sucesso (anti-enumeração preservada)', async () => {
    const { getRecaptchaToken } = await loadPage();
    getRecaptchaToken.mockResolvedValue('tok-ok');
    forgotPassword.mockRejectedValue(new Error('boom'));

    await submitEmail();

    expect(await screen.findByText(/verifique sua caixa de entrada/i)).toBeInTheDocument();
    expect(forgotPassword).toHaveBeenCalledWith('dono@salao.com', 'tok-ok');
  });

  it('token ok + API ok → tela de sucesso', async () => {
    const { getRecaptchaToken } = await loadPage();
    getRecaptchaToken.mockResolvedValue('tok-ok');
    forgotPassword.mockResolvedValue(undefined);

    await submitEmail();

    expect(await screen.findByText(/verifique sua caixa de entrada/i)).toBeInTheDocument();
    expect(forgotPassword).toHaveBeenCalledWith('dono@salao.com', 'tok-ok');
  });
});
