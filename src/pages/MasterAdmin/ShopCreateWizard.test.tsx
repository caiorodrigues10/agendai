/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ShopCreateWizard } from './ShopCreateWizard';
import { adminApi, BarbershopListItem } from '../../infra/adminApi';

vi.mock('../../infra/adminApi', () => ({
  adminApi: {
    listBarbershops: vi.fn(),
    createBarbershop: vi.fn(),
  },
}));

const createBarbershop = vi.mocked(adminApi.createBarbershop);

const createdShop: BarbershopListItem = {
  id: 'shop-new',
  name: 'Barbearia Nova',
  cnpj: null,
  whatsapp: '11999990000',
  address: null,
  active: true,
  approvalStatus: 'APPROVED',
  createdAt: '2026-10-04T12:00:00.000Z',
  _count: { users: 0, appointments: 0, queue: 0 },
};

function setup() {
  const onClose = vi.fn();
  const onCreated = vi.fn();
  render(
    <MemoryRouter>
      <ShopCreateWizard open onClose={onClose} onCreated={onCreated} />
    </MemoryRouter>,
  );
  return { onClose, onCreated };
}

const fillStep1 = (dialog: HTMLElement) => {
  fireEvent.change(within(dialog).getByLabelText('Nome do salão'), {
    target: { value: 'Barbearia Nova' },
  });
  fireEvent.change(within(dialog).getByLabelText(/^WhatsApp/), {
    target: { value: '11999990000' },
  });
};

describe('ShopCreateWizard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('bloqueia avançar sem os campos obrigatórios', async () => {
    setup();
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Avançar' }));
    await waitFor(() => expect(within(dialog).getByText('Informe o nome do salão.')).toBeInTheDocument());
    expect(within(dialog).getByText('Informe o WhatsApp com DDD.')).toBeInTheDocument();
    expect(createBarbershop).not.toHaveBeenCalled();
  });

  it('valida formato do CNPJ', async () => {
    setup();
    const dialog = await screen.findByRole('dialog');
    fillStep1(dialog);
    fireEvent.change(within(dialog).getByLabelText(/CNPJ/), { target: { value: '123' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Avançar' }));
    await waitFor(() =>
      expect(within(dialog).getByText('O CNPJ deve ter 14 dígitos, sem pontuação.')).toBeInTheDocument(),
    );
  });

  it('percorre as etapas e cria o salão com revisão', async () => {
    createBarbershop.mockResolvedValue({ success: true, data: createdShop });
    const { onCreated } = setup();
    const dialog = await screen.findByRole('dialog');

    fillStep1(dialog);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Avançar' }));
    expect(await within(dialog).findByText('2. Endereço e ajustes')).toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText(/Endereço/), {
      target: { value: 'Rua das Flores, 123' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Avançar' }));
    expect(await within(dialog).findByText('3. Revisão')).toBeInTheDocument();
    expect(within(dialog).getByText('Rua das Flores, 123')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Criar salão' }));
    await waitFor(() =>
      expect(createBarbershop).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Barbearia Nova',
          whatsapp: '11999990000',
          address: 'Rua das Flores, 123',
          active: true,
        }),
      ),
    );
    expect(await within(dialog).findByText('Salão criado')).toBeInTheDocument();
    expect(onCreated).toHaveBeenCalledWith(createdShop);
  });

  it('permite voltar etapa e exibe erro da API', async () => {
    createBarbershop.mockRejectedValue(new Error('Já existe'));
    setup();
    const dialog = await screen.findByRole('dialog');
    fillStep1(dialog);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Avançar' }));
    await within(dialog).findByText('2. Endereço e ajustes');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Avançar' }));
    await within(dialog).findByText('3. Revisão');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Criar salão' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Já existe');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Voltar' }));
    expect(await within(dialog).findByText('2. Endereço e ajustes')).toBeInTheDocument();
  });
});
