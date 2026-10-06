/**
 * `ResetPasswordPage` (`/reset-password?token=...`) — página pública de
 * redefinição de senha. Não há fetch no mount: o único endpoint é o POST do
 * submit (`authApi.resetPassword`), então as stories que não submetem não
 * precisam de MSW.
 *
 * O banner de erro do `handleSubmit` (ResetPasswordPage.tsx:147-152) é o futuro
 * site do `SectionError`.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { http, HttpResponse, type RequestHandler } from 'msw';
import { expect, fireEvent, waitFor, within } from 'storybook/test';
import { ResetPasswordPage } from './ResetPasswordPage';
import { ThemeProvider } from '../contexts/ThemeContext';

/** Token no `?token=` — o form só habilita o submit com `token.length > 10`. */
const RESET_TOKEN = 'token-valido';
const NOVA_SENHA = 'SenhaForte123';

/**
 * A página não busca nada no mount (nenhum `useEffect`/fetch): o único endpoint
 * é o `POST /api/auth/reset-password` do submit, tratado na story `Erro`.
 */
const mswHandlers: RequestHandler[] = [];

const resetPasswordErro = http.post('/api/auth/reset-password', () =>
  HttpResponse.json(
    { success: false, message: 'Não foi possível redefinir a senha. Tente novamente.' },
    { status: 500 }
  )
);

const meta = {
  title: 'Públicas/ResetPasswordPage',
  component: ResetPasswordPage,
  tags: ['autodocs', 'test'],
  decorators: [
    Story => (
      <MemoryRouter initialEntries={[`/reset-password?token=${RESET_TOKEN}`]}>
        <ThemeProvider>
          <Routes>
            <Route path="/reset-password" element={<Story />} />
            <Route path="/login" element={<p>página de login</p>} />
          </Routes>
        </ThemeProvider>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ResetPasswordPage>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Sem request: o form "Redefinir senha" renderiza com os dois campos de senha e
 * o botão de submit desabilitado até o token/senha serem válidos.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Crie uma nova senha segura para sua conta.', {}, { timeout: 10000 });
    await canvas.findByLabelText(/^Nova senha/, {}, { timeout: 10000 });
    await canvas.findByRole('button', { name: /Redefinir senha/ }, { timeout: 10000 });
  },
};

/**
 * Falha do submit (`POST /api/auth/reset-password` → 500
 * `{ success: false, message: 'Não foi possível redefinir a senha. Tente novamente.' }`):
 * o `catch` do `handleSubmit` mostra a `message` da resposta no banner inline
 * acima do form (ResetPasswordPage.tsx:147-152 — futuro site do `SectionError`).
 */
export const Erro: Story = {
  parameters: {
    msw: {
      handlers: [...mswHandlers, resetPasswordErro],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    fireEvent.change(await canvas.findByLabelText(/^Nova senha/, {}, { timeout: 10000 }), {
      target: { value: NOVA_SENHA },
    });
    fireEvent.change(await canvas.findByLabelText(/Confirmar nova senha/, {}, { timeout: 10000 }), {
      target: { value: NOVA_SENHA },
    });
    const submit = await canvas.findByRole(
      'button',
      { name: /Redefinir senha/ },
      { timeout: 10000 }
    );
    await waitFor(() => expect(submit).toBeEnabled(), { timeout: 10000 });
    fireEvent.click(submit);
    await canvas.findByText(/Não foi possível redefinir a senha/, {}, { timeout: 10000 });
    await canvas.findByText('Crie uma nova senha segura para sua conta.', {}, { timeout: 10000 });
  },
};
