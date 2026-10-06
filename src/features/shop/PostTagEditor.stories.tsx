import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { PostTagEditor } from './PostTagEditor';

const json = (data: unknown) => HttpResponse.json({ success: true, data });

/** `GET /api/barbershops` → salões candidatos (o próprio `salonId` é filtrado). */
const shops = [
  { id: 'shop-2', name: 'Barbearia Norte', city: 'São Paulo', active: true },
  { id: 'shop-3', name: 'Studio Lume', city: 'Campinas', active: true },
];

const listOk = http.get('/api/barbershops', () => json(shops));

/**
 * `POST /api/salons/:salonId/posts/:postId/tags` → 500: dispara o `error` do
 * catch de `send` (PostTagEditor L49 → banner L80-84).
 */
const tagFail = http.post('/api/salons/:salonId/posts/:postId/tags', () =>
  HttpResponse.json(
    { success: false, message: 'Não foi possível solicitar a marcação.' },
    { status: 500 }
  )
);

const mswHandlers = () => [listOk];

const meta = {
  title: 'Loja/PostTagEditor',
  component: PostTagEditor,
  tags: ['autodocs', 'test'],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers() },
  },
  args: { salonId: 'shop-1', postId: 'post-1' },
} satisfies Meta<typeof PostTagEditor>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Abre o SmartSelect e escolhe o primeiro salão. O popup vive num
 * `FloatingPortal` (fora do canvas) e o clique coordenado pode cair no ancestral
 * quando o floating-ui reposiciona — por isso o `fireEvent.click` direto no
 * option, igual à GoalsPanel.
 */
const pickShop = async (canvas: ReturnType<typeof within>) => {
  await canvas.findByText('Marcar outro salão', {}, { timeout: 10000 });
  await userEvent.click(
    await canvas.findByRole('combobox', { name: 'Salão marcado' }, { timeout: 10000 })
  );
  const body = within(document.body);
  const option = await body.findByRole('option', { name: /Barbearia Norte/ }, {
    timeout: 10000,
  });
  fireEvent.click(option);
  await waitFor(
    () =>
      expect(
        canvas.getByRole('combobox', { name: 'Salão marcado' })
      ).toHaveTextContent('Barbearia Norte'),
    { timeout: 10000 }
  );
};

/**
 * Salões carregados (GET /api/barbershops → success/data) e um salão já
 * selecionado no SmartSelect, com o botão "Solicitar marcação" habilitado.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await pickShop(canvas);
  },
};

/**
 * Falha da marcação (POST /api/salons/:salonId/posts/:postId/tags → 500): banner
 * `role="alert"` com a mensagem do catch de `send` (PostTagEditor L49), abaixo do
 * botão, com o salão alvo ainda selecionado — estado final do play.
 */
export const Erro: Story = {
  parameters: { msw: { handlers: [...mswHandlers(), tagFail] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await pickShop(canvas);
    await userEvent.click(
      await canvas.findByRole('button', { name: /Solicitar marcação/ }, { timeout: 10000 })
    );
    const alert = await canvas.findByRole('alert', {}, { timeout: 10000 });
    expect(alert).toHaveTextContent(/Não foi possível solicitar a marcação/);
  },
};
