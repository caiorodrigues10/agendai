/// <reference types="vitest/globals" />
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ProductCatalogPanel } from './ProductCatalogPanel';

const mocks = vi.hoisted(() => ({
  api: {
    listProducts: vi.fn(),
    listCategories: vi.fn(),
    deleteProduct: vi.fn(),
    updateProduct: vi.fn(),
  },
  notify: vi.fn(),
  reload: vi.fn(),
}));
vi.mock('../../../infra/productsApi', () => ({ productsApi: mocks.api }));
vi.mock('../../../contexts/BarbershopContext', () => ({ useBarbershop: () => ({ settings: null }) }));
vi.mock('../../../contexts/AuthContext', () => ({ useAuth: () => ({ user: { barbershopId: 'shop-1', role: 'OWNER' } }) }));

const PRODUCT = {
  id: 'prod-1',
  name: 'Shampoo hidratante',
  type: 'RETAIL',
  salePrice: 10,
  stockQty: 3,
  unit: 'UNIT',
  minStock: 0,
  active: true,
  averageCost: null,
  imageUrl: null,
  category: null,
  expirationStatus: null,
} as never;

function renderPanel(canManage: boolean) {
  return render(
    <ProductCatalogPanel
      canManage={canManage}
      canView
      canSeeCost={false}
      loadError={null}
      onNotify={mocks.notify}
      onReload={mocks.reload}
    />
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.api.listProducts.mockResolvedValue({ data: [PRODUCT], meta: { total: 1 } });
  mocks.api.listCategories.mockResolvedValue([]);
  mocks.api.deleteProduct.mockResolvedValue({ deleted: true });
});

describe('ProductCatalogPanel — ações do card', () => {
  it('sem canManage não mostra editar, inativar, apagar nem "Novo produto"', async () => {
    renderPanel(false);
    expect(await screen.findByText('Shampoo hidratante')).toBeInTheDocument();
    expect(screen.queryByLabelText('Editar produto')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Apagar produto')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Inativar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /\+ Novo produto/ })).not.toBeInTheDocument();
    expect(mocks.api.deleteProduct).not.toHaveBeenCalled();
  });

  it('com canManage apaga pelo ícone, com aviso e recarga', async () => {
    renderPanel(true);
    fireEvent.click(await screen.findByLabelText('Apagar produto'));

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent(
      'Apagar Shampoo hidratante? Esta ação não pode ser desfeita. Se o produto já teve vendas ou movimentação de estoque, use Inativar.'
    );

    fireEvent.click(screen.getByRole('button', { name: /^Apagar$/ }));
    await waitFor(() => expect(mocks.api.deleteProduct).toHaveBeenCalledWith('prod-1'));
    expect(mocks.notify).toHaveBeenCalledWith('Produto apagado.', 'success');
    expect(mocks.reload).toHaveBeenCalled();
    await waitFor(() => expect(mocks.api.listProducts).toHaveBeenCalledTimes(2));
  });

  it('mostra a mensagem do backend quando o produto tem histórico', async () => {
    mocks.api.deleteProduct.mockRejectedValue(
      new Error('Este produto já tem histórico de estoque ou vendas. Use Inativar para mantê-lo fora das listas.')
    );
    renderPanel(true);
    fireEvent.click(await screen.findByLabelText('Apagar produto'));
    fireEvent.click(await screen.findByRole('button', { name: /^Apagar$/ }));

    await waitFor(() =>
      expect(mocks.notify).toHaveBeenCalledWith(
        'Este produto já tem histórico de estoque ou vendas. Use Inativar para mantê-lo fora das listas.',
        'error'
      )
    );
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});

const RESERVED_PRODUCT = {
  id: 'prod-2',
  name: 'Pomada modeladora',
  type: 'RETAIL',
  salePrice: 10,
  unit: 'UNIT',
  minStock: 0,
  active: true,
  averageCost: null,
  imageUrl: null,
  category: null,
  expirationStatus: null,
  stockQty: 5,
  reservedQty: 2,
  availableQty: 3,
  reservations: [
    { id: 'res-1', customerName: 'Ana Souza', whatsapp: '11988887777', quantity: 1, expiresAt: '2026-10-03T18:00:00.000Z' },
    { id: 'res-2', customerName: 'Bia Ramos', whatsapp: '11977776666', quantity: 1, expiresAt: '2026-10-04T18:00:00.000Z' },
  ],
} as never;

const RESERVED_NO_LIST = {
  id: 'prod-3',
  name: 'Cera forte',
  type: 'RETAIL',
  salePrice: 20,
  unit: 'UNIT',
  minStock: 0,
  active: true,
  averageCost: null,
  imageUrl: null,
  category: null,
  expirationStatus: null,
  stockQty: 5,
  reservedQty: 2,
  availableQty: 3,
} as never;

function renderReserved(product: unknown, extra: { onGoReservations?: () => void } = {}) {
  mocks.api.listProducts.mockResolvedValue({ data: [product], meta: { total: 1 } });
  return render(
    <ProductCatalogPanel
      canManage
      canView
      canSeeCost={false}
      loadError={null}
      onNotify={mocks.notify}
      onReload={mocks.reload}
      {...extra}
    />
  );
}

describe('ProductCatalogPanel — reservas no card', () => {
  it('mostra selo Reservado e o resumo de estoque quando há reserva vigente', async () => {
    renderReserved(RESERVED_PRODUCT);

    expect(await screen.findByText('Reservado · 2 un')).toBeInTheDocument();
    expect(screen.getByText('Em estoque 5 · reservado 2 · livre 3')).toBeInTheDocument();
  });

  it('expande a lista de reservas sem abrir o modal de edição', async () => {
    renderReserved(RESERVED_PRODUCT);
    fireEvent.click(await screen.findByRole('button', { name: /Ver reservas \(2\)/ }));

    expect(await screen.findByText('1× · Ana Souza · (11) 98888-7777')).toBeInTheDocument();
    expect(screen.getByText('1× · Bia Ramos · (11) 97777-6666')).toBeInTheDocument();
    const links = screen.getAllByRole('link', { name: /Chamar no WhatsApp/ });
    expect(links[0]).toHaveAttribute('href', 'https://wa.me/5511988887777');
    expect(links[1]).toHaveAttribute('href', 'https://wa.me/5511977776666');
    expect(screen.queryByRole('heading', { name: 'Editar produto' })).not.toBeInTheDocument();
  });

  it('recolhe a lista ao clicar de novo em Ver reservas', async () => {
    renderReserved(RESERVED_PRODUCT);
    const toggle = await screen.findByRole('button', { name: /Ver reservas \(2\)/ });

    fireEvent.click(toggle);
    expect(await screen.findByText('1× · Ana Souza · (11) 98888-7777')).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(screen.queryByText('1× · Ana Souza · (11) 98888-7777')).not.toBeInTheDocument();
  });

  it('atalho "Ver todas" aciona a navegação para a aba de reservas', async () => {
    const onGoReservations = vi.fn();
    renderReserved(RESERVED_PRODUCT, { onGoReservations });

    fireEvent.click(await screen.findByRole('button', { name: 'Ver todas' }));
    expect(onGoReservations).toHaveBeenCalledTimes(1);
  });

  it('sem lista de reservas exibe apenas o selo', async () => {
    renderReserved(RESERVED_NO_LIST);

    expect(await screen.findByText('Reservado · 2 un')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ver reservas/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ver todas' })).not.toBeInTheDocument();
  });

  it('sem reserva não mostra selo nem resumo de estoque', async () => {
    renderReserved(PRODUCT);

    expect(await screen.findByText('Shampoo hidratante')).toBeInTheDocument();
    expect(screen.queryByText(/Reservado/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Em estoque/)).not.toBeInTheDocument();
  });
});
