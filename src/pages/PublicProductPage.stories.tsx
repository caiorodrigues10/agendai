import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { fireEvent, within } from 'storybook/test';
import { PublicProductPage } from './PublicProductPage';
import type { PublicProduct, PublicShop } from '../infra/publicProductsApi';

const SHOP_ID = 'shop-1';
const PRODUCT_ID = 'prod-1';

const shop: PublicShop = {
  name: 'Barbearia Central',
  address: 'Rua das Flores, 120',
  city: 'São Paulo',
  whatsapp: '11999999999',
};

const product: PublicProduct = {
  id: PRODUCT_ID,
  name: 'Pomada modeladora',
  description: 'Fixação forte com acabamento mate.',
  imageUrl: null,
  price: 49.9,
  unitLabel: 'un',
  category: 'Cabelo',
  available: 3,
};

/**
 * `GET /api/barbershops/shop-1/public-products/prod-1` → envelope
 * `{ success, data: { shop, product } }` (o wrapper faz `unwrap` em `res.data`).
 * Os params da rota (`:id`, `:productId`) alimentam o wrapper `get`.
 */
const productOk = http.get(`/api/barbershops/${SHOP_ID}/public-products/${PRODUCT_ID}`, () =>
  HttpResponse.json({ success: true, data: { shop, product } })
);

const mswHandlers = [productOk];

const meta = {
  title: 'Públicas/PublicProductPage',
  component: PublicProductPage,
  tags: ['autodocs', 'test'],
  decorators: [
    Story => (
      <MemoryRouter initialEntries={[`/queue/${SHOP_ID}/produtos/${PRODUCT_ID}`]}>
        <Routes>
          <Route path="/queue/:id/produtos/:productId" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers },
  },
} satisfies Meta<typeof PublicProductPage>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Produto carregado (`GET /api/barbershops/:barbershopId/public-products/:productId`) com o formulário de reserva habilitado. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole('heading', { name: 'Pomada modeladora' }, { timeout: 10000 });
    await canvas.findByText('Disponível: 3 un', {}, { timeout: 10000 });
    await canvas.findByRole('button', { name: 'Reservar produto' }, { timeout: 10000 });
  },
};

/**
 * Falha da reserva (`POST /api/barbershops/:barbershopId/public-products/:productId/reservations`
 * → 500 `{ success: false, message }`): banner inline `submitError` dentro do
 * formulário (site futuro do SectionError) mantém a página de produto.
 */
export const ErroReserva: Story = {
  parameters: {
    msw: {
      handlers: [
        ...mswHandlers,
        http.post(`/api/barbershops/${SHOP_ID}/public-products/${PRODUCT_ID}/reservations`, () =>
          HttpResponse.json(
            {
              success: false,
              message: 'Não foi possível reservar este produto. Tente novamente.',
            },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole('heading', { name: 'Pomada modeladora' }, { timeout: 10000 });
    await fireEvent.change(
      await canvas.findByPlaceholderText('Ex: João Silva', {}, { timeout: 10000 }),
      { target: { value: 'João Silva' } }
    );
    await fireEvent.change(
      await canvas.findByPlaceholderText('(11) 99999-9999', {}, { timeout: 10000 }),
      { target: { value: '11999999999' } }
    );
    await fireEvent.click(
      await canvas.findByRole('button', { name: 'Aumentar quantidade' }, { timeout: 10000 })
    );
    await fireEvent.click(
      await canvas.findByRole('button', { name: 'Reservar produto' }, { timeout: 10000 })
    );
    await canvas.findByText(/Não foi possível reservar este produto/, {}, { timeout: 10000 });
    await canvas.findByRole('button', { name: 'Reservar produto' }, { timeout: 10000 });
  },
};
