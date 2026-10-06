/**
 * `PublicOwnerInvitePage` (`/convite/:token`) — convite público de dono de
 * salão. Não há fetch no mount (nem detalhes do convite): o único endpoint é o
 * `POST /api/auth/accept-invite` do submit, tratado na story `Erro`.
 *
 * A página cai na tela "Link inválido" quando `token.length < 32`, então o token
 * da rota precisa ter ≥ 32 caracteres para exibir o form.
 *
 * O banner `role="alert"` do `OwnerInviteForm` (PublicOwnerInvitePage.tsx:58-66)
 * é o futuro site do `SectionError`.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { http, HttpResponse, type RequestHandler } from 'msw';
import { expect, fireEvent, waitFor, within } from 'storybook/test';
import { PublicOwnerInvitePage } from './PublicOwnerInvitePage';
import { ThemeProvider } from '../contexts/ThemeContext';

/** ≥ 32 chars: abaixo disso a página renderiza "Link inválido" em vez do form. */
const INVITE_TOKEN = `convite-valido-${'a'.repeat(32)}`;
const NOVA_SENHA = 'NovaSenha123';

/**
 * A página não busca nada no mount: o único endpoint é o
 * `POST /api/auth/accept-invite` do submit, tratado na story `Erro`.
 */
const mswHandlers: RequestHandler[] = [];

const acceptInviteErro = http.post('/api/auth/accept-invite', () =>
  HttpResponse.json(
    { success: false, message: 'Link inválido ou expirado. Solicite um novo convite.' },
    { status: 500 }
  )
);

const meta = {
  title: 'Públicas/PublicOwnerInvitePage',
  component: PublicOwnerInvitePage,
  tags: ['autodocs', 'test'],
  decorators: [
    Story => (
      <MemoryRouter initialEntries={[`/convite/${INVITE_TOKEN}`]}>
        <ThemeProvider>
          <Routes>
            <Route path="/convite/:token" element={<Story />} />
            <Route path="/login" element={<p>página de login</p>} />
          </Routes>
        </ThemeProvider>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PublicOwnerInvitePage>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Sem request: o form "Definir senha" renderiza com os dois campos e o submit
 * desabilitado até a senha ser forte (letras + números) e as senhas coincidirem.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Defina a senha de acesso ao painel do seu salão.', {}, {
      timeout: 10000,
    });
    await canvas.findByLabelText(/^Nova senha/, {}, { timeout: 10000 });
    await canvas.findByRole('button', { name: /Definir senha/ }, { timeout: 10000 });
  },
};

/**
 * Falha do submit (`POST /api/auth/accept-invite` → 500
 * `{ success: false, message: 'Link inválido ou expirado. Solicite um novo convite.' }`):
 * o `catch` do `OwnerInviteForm` exibe a `message` no banner `role="alert"` acima
 * do form (PublicOwnerInvitePage.tsx:58-66 — futuro site do `SectionError`).
 */
export const Erro: Story = {
  parameters: {
    msw: {
      handlers: [...mswHandlers, acceptInviteErro],
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
      { name: /Definir senha/ },
      { timeout: 10000 }
    );
    await waitFor(() => expect(submit).toBeEnabled(), { timeout: 10000 });
    fireEvent.click(submit);
    await canvas.findByText(/Link inválido ou expirado/, {}, { timeout: 10000 });
    await canvas.findByRole('alert', {}, { timeout: 10000 });
  },
};
