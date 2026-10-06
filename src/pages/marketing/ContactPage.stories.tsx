import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { userEvent, within } from 'storybook/test';
import { ContactPage } from './ContactPage';
import { StoryProviders } from '../../tests/storyProviders';

const contactFailHandler = http.post('/api/contact', () =>
  HttpResponse.json(
    { success: false, message: 'Não foi possível enviar. Tente de novo em instantes.' },
    { status: 500 }
  )
);

const meta = {
  title: 'Marketing/ContactPage',
  component: ContactPage,
  tags: ['autodocs', 'test'],
  decorators: [
    Story => (
      <MemoryRouter initialEntries={['/contato']}>
        <StoryProviders withAuth>
          <Story />
        </StoryProviders>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ContactPage>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A página usa framer-motion (`initial opacity 0 → animate`); o axe do
 * addon-a11y roda no `afterEach`, logo após o play, e amostraria cores no
 * meio do fade (contrastes falsos). Espera as animações de entrada terminarem.
 */
const settleMotion = () => new Promise(resolve => setTimeout(resolve, 1500));

/**
 * Página estática (nenhuma chamada no mount): o formulário RHF+zod render
 * completo com o assunto "Planos e preços" já selecionado.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole('heading', { name: /Como podemos ajudar/ }, { timeout: 10000 });
    await canvas.findByRole('button', { name: /Enviar mensagem/ }, { timeout: 10000 });
    await settleMotion();
  },
};

/**
 * `POST /api/contact` → 500 `{ success: false, message }`: depois do envio
 * válido, o banner de erro (futuro SectionError) aparece acima do formulário
 * com a mensagem devolvida pelo backend.
 */
export const Erro: Story = {
  parameters: {
    msw: { handlers: [contactFailHandler] },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole('heading', { name: /Como podemos ajudar/ }, { timeout: 10000 });
    await userEvent.type(
      await canvas.findByPlaceholderText('Como te chamamos', {}, { timeout: 10000 }),
      'Ana Silva'
    );
    await userEvent.type(
      await canvas.findByPlaceholderText('seu@email.com', {}, { timeout: 10000 }),
      'ana@exemplo.com'
    );
    await userEvent.type(
      await canvas.findByPlaceholderText(/Conte o contexto/, {}, { timeout: 10000 }),
      'Preciso entender o plano Pro para o meu salão.'
    );
    await userEvent.click(
      await canvas.findByRole('button', { name: /Enviar mensagem/ }, { timeout: 10000 })
    );
    await canvas.findByText(
      /Não foi possível enviar/,
      {},
      { timeout: 10000 }
    );
    await settleMotion();
  },
};
