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

