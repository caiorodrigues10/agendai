/// <reference types="vitest/globals" />
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ProductFormModal } from './ProductFormModal';
import type { Product } from '../../infra/productsApi';

const mocks = vi.hoisted(() => ({
  api: {
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    adjustStock: vi.fn(),
    createCategory: vi.fn(),
    uploadProductImage: vi.fn(),
  },
  notify: vi.fn(),
  saved: vi.fn(),
  closed: vi.fn(),
}));
vi.mock('../../infra/productsApi', () => ({ productsApi: mocks.api }));

const OTHER_UNIT_LABEL = 'Quando a unidade é "Outra", o nome da unidade é obrigatório';

function renderModal() {
  return render(
    <ProductFormModal
      open
      product={null}
      categories={[]}
      onClose={mocks.closed}
      onSaved={mocks.saved}
      onNotify={mocks.notify}
    />
  );
}

const fillName = (value: string) =>
  fireEvent.change(screen.getByLabelText('Nome'), { target: { value } });

const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Cadastrar produto' }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.api.createProduct.mockResolvedValue({ id: 'prod-1' });
  mocks.api.updateProduct.mockResolvedValue({ id: 'prod-1' });
  mocks.api.adjustStock.mockResolvedValue({});
});

describe('ProductFormModal — unidade do produto', () => {
  it('cadastra com unidade "Unidade" sem exigir nome de unidade', async () => {
    renderModal();
    expect(screen.queryByLabelText('Nome da unidade')).not.toBeInTheDocument();
    fillName('Shampoo hidratante');
    submit();
    await waitFor(() => expect(mocks.api.createProduct).toHaveBeenCalledTimes(1));
    const payload = mocks.api.createProduct.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.unit).toBe('UNIT');
    expect(payload.unitLabel).toBeUndefined();
    expect(mocks.notify).toHaveBeenCalledWith('Produto cadastrado.', 'success');
    expect(mocks.saved).toHaveBeenCalledTimes(1);
  });

  it('mostra erro quando a unidade é "Outra" e o nome da unidade está vazio', async () => {
    renderModal();
    fillName('Shampoo hidratante');
    fireEvent.click(screen.getByLabelText('Unidade'));
    fireEvent.click(await screen.findByRole('option', { name: 'Outra' }));
    expect(screen.getByLabelText('Nome da unidade')).toBeInTheDocument();
    submit();
    await waitFor(() =>
      expect(mocks.notify).toHaveBeenCalledWith(OTHER_UNIT_LABEL, 'error')
    );
    expect(mocks.api.createProduct).not.toHaveBeenCalled();
    expect(mocks.saved).not.toHaveBeenCalled();
    expect(mocks.notify).not.toHaveBeenCalledWith('Produto cadastrado.', 'success');
  });
});

const EXISTING_PRODUCT: Product = {
  id: 'prod-1',
  barbershopId: 'shop-1',
  categoryId: null,
  name: 'Shampoo hidratante',
  description: null,
  sku: null,
  barcode: null,
  imageUrl: null,
  unit: 'UNIT',
  unitLabel: 'un',
  salePrice: 10,
  stockQty: 0,
  minStock: 3,
  active: true,
  type: 'RETAIL',
  trackStock: true,
};

const payload = () => mocks.api.createProduct.mock.calls[0][0] as Record<string, unknown>;

describe('ProductFormModal — estoque inicial', () => {
  it('mostra o campo de estoque inicial apenas no cadastro', () => {
    const createView = renderModal();
    expect(screen.getByLabelText(/Estoque inicial/)).toBeInTheDocument();
    createView.unmount();

    render(
      <ProductFormModal
        open
        product={EXISTING_PRODUCT}
        categories={[]}
        onClose={mocks.closed}
        onSaved={mocks.saved}
        onNotify={mocks.notify}
      />
    );
    expect(screen.queryByLabelText(/Estoque inicial/)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Estoque atual/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Estoque mínimo/)).toBeInTheDocument();
  });

  it('envia initialStock informado no cadastro', async () => {
    renderModal();
    fillName('Shampoo hidratante');
    fireEvent.change(screen.getByLabelText(/Estoque inicial/), { target: { value: '10' } });
    submit();
    await waitFor(() => expect(mocks.api.createProduct).toHaveBeenCalledTimes(1));
    expect(payload().initialStock).toBe(10);
    expect(payload().minStock).toBe(0);
  });

  it('não envia initialStock quando "Controlar estoque" está desmarcado', async () => {
    renderModal();
    fillName('Shampoo hidratante');
    fireEvent.change(screen.getByLabelText(/Estoque inicial/), { target: { value: '10' } });
    fireEvent.click(screen.getByLabelText('Controlar estoque'));
    expect(screen.queryByLabelText(/Estoque inicial/)).not.toBeInTheDocument();
    submit();
    await waitFor(() => expect(mocks.api.createProduct).toHaveBeenCalledTimes(1));
    expect(payload().trackStock).toBe(false);
    expect(payload()).not.toHaveProperty('initialStock');
  });
});

const renderEdit = (product: Product = EXISTING_PRODUCT) =>
  render(
    <ProductFormModal
      open
      product={product}
      categories={[]}
      onClose={mocks.closed}
      onSaved={mocks.saved}
      onNotify={mocks.notify}
    />
  );

const submitEdit = () => fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

const updatePayload = () => mocks.api.updateProduct.mock.calls[0][1] as Record<string, unknown>;

describe('ProductFormModal — ajuste de estoque na edição', () => {
  it('alterar "Estoque atual" salva o produto e registra o ajuste manual (+10)', async () => {
    renderEdit();
    fireEvent.change(screen.getByLabelText(/Estoque atual/), { target: { value: '10' } });
    submitEdit();

    await waitFor(() => expect(mocks.api.adjustStock).toHaveBeenCalledTimes(1));
    expect(mocks.api.adjustStock).toHaveBeenCalledWith({
      productId: 'prod-1',
      quantity: 10,
      reason: 'Ajuste de estoque pela edição do produto',
      type: 'MANUAL_ADJUSTMENT',
    });

    expect(mocks.api.updateProduct).toHaveBeenCalledTimes(1);
    expect(updatePayload()).not.toHaveProperty('initialStock');
    expect(updatePayload()).not.toHaveProperty('stockQty');
    expect(mocks.api.updateProduct.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.api.adjustStock.mock.invocationCallOrder[0]
    );

    await waitFor(() => expect(mocks.closed).toHaveBeenCalledTimes(1));
    expect(mocks.saved).toHaveBeenCalledTimes(1);
  });

  it('reduzir o estoque de 10 para 4 registra ajuste negativo (-6)', async () => {
    renderEdit({ ...EXISTING_PRODUCT, stockQty: 10 });
    fireEvent.change(screen.getByLabelText(/Estoque atual/), { target: { value: '4' } });
    submitEdit();

    await waitFor(() => expect(mocks.api.adjustStock).toHaveBeenCalledTimes(1));
    expect(mocks.api.adjustStock).toHaveBeenCalledWith(
      expect.objectContaining({ productId: 'prod-1', quantity: -6, type: 'MANUAL_ADJUSTMENT' })
    );
    await waitFor(() => expect(mocks.closed).toHaveBeenCalledTimes(1));
  });

  it('não chama adjustStock quando o estoque não muda', async () => {
    renderEdit();
    submitEdit();

    await waitFor(() => expect(mocks.closed).toHaveBeenCalledTimes(1));
    expect(mocks.api.updateProduct).toHaveBeenCalledTimes(1);
    expect(mocks.api.adjustStock).not.toHaveBeenCalled();
  });

  it('mantém o modal aberto e avisa quando o ajuste falha', async () => {
    mocks.api.adjustStock.mockRejectedValue(new Error('Sem permissão'));
    renderEdit();
    fireEvent.change(screen.getByLabelText(/Estoque atual/), { target: { value: '10' } });
    submitEdit();

    await waitFor(() =>
      expect(mocks.notify).toHaveBeenCalledWith(
        'Produto salvo, mas não foi possível ajustar o estoque: Sem permissão',
        'error'
      )
    );
    expect(mocks.api.updateProduct).toHaveBeenCalledTimes(1);
    expect(mocks.closed).not.toHaveBeenCalled();
    expect(mocks.saved).not.toHaveBeenCalled();
  });

  it('rejeita quantidade negativa sem salvar', async () => {
    renderEdit();
    fireEvent.change(screen.getByLabelText(/Estoque atual/), { target: { value: '-1' } });
    submitEdit();

    await waitFor(() =>
      expect(mocks.notify).toHaveBeenCalledWith('Quantidade não pode ser negativa', 'error')
    );
    expect(mocks.api.updateProduct).not.toHaveBeenCalled();
    expect(mocks.api.adjustStock).not.toHaveBeenCalled();
    expect(mocks.closed).not.toHaveBeenCalled();
  });
});
