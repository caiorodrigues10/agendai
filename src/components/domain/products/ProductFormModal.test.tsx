/// <reference types="vitest/globals" />
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ProductFormModal } from './ProductFormModal';

const mocks = vi.hoisted(() => ({
  api: { createProduct: vi.fn(), updateProduct: vi.fn(), createCategory: vi.fn(), uploadProductImage: vi.fn() },
  notify: vi.fn(),
  saved: vi.fn(),
  closed: vi.fn(),
}));
vi.mock('../../../infra/productsApi', () => ({ productsApi: mocks.api }));

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
