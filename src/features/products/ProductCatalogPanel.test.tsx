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
vi.mock('../../infra/productsApi', () => ({ productsApi: mocks.api }));
vi.mock('../../contexts/BarbershopContext', () => ({ useBarbershop: () => ({ settings: null }) }));
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => ({ user: { barbershopId: 'shop-1', role: 'OWNER' } }) }));

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

const ACTIVE_TRACKED = {
  id: 'prod-act',
  name: 'Gel reposto',
  type: 'RETAIL',
  salePrice: 25,
  stockQty: 5,
  unit: 'UNIT',
  minStock: 1,
  active: true,
  trackStock: true,
  averageCost: null,
  imageUrl: null,
  category: null,
  expirationStatus: null,
} as never;

const INACTIVE_PRODUCT = {
  id: 'prod-inact',
  name: 'Shampoo hidratante',
  type: 'RETAIL',
  salePrice: 10,
  stockQty: 5,
  unit: 'UNIT',
  minStock: 1,
  active: false,
  trackStock: true,
  averageCost: null,
  imageUrl: null,
  category: null,
  expirationStatus: null,
} as never;

const INACTIVE_RESERVED = {
  id: 'prod-inact-res',
  name: 'Cera forte',
  type: 'RETAIL',
  salePrice: 20,
  stockQty: 5,
  reservedQty: 2,
  availableQty: 3,
  unit: 'UNIT',
  minStock: 1,
  active: false,
  trackStock: true,
  averageCost: null,
  imageUrl: null,
  category: null,
  expirationStatus: null,
  reservations: [
    { id: 'res-9', customerName: 'Ana Souza', whatsapp: '11988887777', quantity: 1, expiresAt: '2026-10-03T18:00:00.000Z' },
    { id: 'res-10', customerName: 'Bia Ramos', whatsapp: '11977776666', quantity: 1, expiresAt: '2026-10-04T18:00:00.000Z' },
  ],
} as never;

function renderWith(products: unknown[]) {
  mocks.api.listProducts.mockResolvedValue({ data: products, meta: { total: products.length } });
  return render(
    <ProductCatalogPanel
      canManage
      canView
      canSeeCost={false}
      loadError={null}
      onNotify={mocks.notify}
      onReload={mocks.reload}
    />
  );
}

describe('ProductCatalogPanel — card inativo', () => {
  it('mostra a faixa "Produto inativo", esconde o badge de estoque e oferece Ativar', async () => {
    renderWith([INACTIVE_PRODUCT]);

    expect(await screen.findByText('Produto inativo · não aparece no PDV nem na vitrine')).toBeInTheDocument();
    expect(screen.queryByText('ok')).not.toBeInTheDocument();
    expect(screen.getByText('Inativo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ativar Shampoo hidratante' })).toBeInTheDocument();

    const card = screen.getByTestId('inactive-strip').parentElement;
    expect(card).toHaveClass('border-dashed', 'bg-bg/40', 'transition-colors', 'duration-200');
    expect(card).not.toHaveClass('hover:shadow-sm');
  });

  it('mantém o selo Reservado e avisa sobre reservas pendentes na faixa', async () => {
    renderWith([INACTIVE_RESERVED]);

    expect(await screen.findByText('Reservado · 2 un')).toBeInTheDocument();
    expect(screen.getByText(/Há 2 reservas pendentes/)).toBeInTheDocument();
    expect(screen.queryByText('ok')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver reservas (2)' })).toBeInTheDocument();
  });

  it('card ativo mantém o badge "ok" e o botão Inativar', async () => {
    renderWith([ACTIVE_TRACKED]);

    expect(await screen.findByText('ok')).toBeInTheDocument();
    expect(screen.queryByTestId('inactive-strip')).not.toBeInTheDocument();
    expect(screen.queryByText('Inativo')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Inativar' })).toBeInTheDocument();
  });

  it('ativa pelo rodapé: confirma, chama a API e avisa "Produto ativado"', async () => {
    renderWith([INACTIVE_PRODUCT]);
    fireEvent.click(await screen.findByRole('button', { name: 'Ativar Shampoo hidratante' }));

    expect(await screen.findByRole('alertdialog')).toHaveTextContent('Reativar produto?');
    fireEvent.click(screen.getByRole('button', { name: /^Ativar$/ }));

    await waitFor(() => expect(mocks.api.updateProduct).toHaveBeenCalledWith('prod-inact', { active: true }));
    expect(mocks.notify).toHaveBeenCalledWith('Produto ativado', 'success');
    await waitFor(() => expect(mocks.api.listProducts).toHaveBeenCalledTimes(2));
  });

  it('lista inativos depois dos ativos e esconde quando "Mostrar inativos" é desmarcado', async () => {
    renderWith([INACTIVE_PRODUCT, ACTIVE_TRACKED]);

    const strip = await screen.findByTestId('inactive-strip');
    expect(screen.getByRole('checkbox', { name: /Mostrar inativos \(1\)/ })).toBeChecked();
    expect(screen.getByText('Gel reposto').compareDocumentPosition(strip) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    fireEvent.click(screen.getByRole('checkbox', { name: /Mostrar inativos/ }));

    expect(screen.queryByTestId('inactive-strip')).not.toBeInTheDocument();
    expect(screen.queryByText('Shampoo hidratante')).not.toBeInTheDocument();
    expect(screen.getByText('Gel reposto')).toBeInTheDocument();
  });
});
