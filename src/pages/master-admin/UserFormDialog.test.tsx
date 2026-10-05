/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { UserFormDialog } from './UserFormDialog';
import { adminApi, BarbershopListItem, UserListItem } from '../../infra/adminApi';

vi.mock('../../infra/adminApi', () => ({
  adminApi: {
    listUsers: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    listBarbershops: vi.fn(),
  },
}));

const listBarbershops = vi.mocked(adminApi.listBarbershops);
const createUser = vi.mocked(adminApi.createUser);
const updateUser = vi.mocked(adminApi.updateUser);

const shop: BarbershopListItem = {
  id: 'shop-1',
  name: 'Salão Central',
  cnpj: null,
  whatsapp: '11999990000',
  address: null,
  active: true,
  approvalStatus: 'APPROVED',
  createdAt: '2026-09-01T12:00:00.000Z',
  _count: { users: 1, appointments: 0, queue: 0 },
};

const editUser: UserListItem = {
  id: 'u-1',
  name: 'Dono Teste',
  email: 'dono@x.com',
  role: 'OWNER',
  active: true,
  barbershopId: 'shop-1',
  createdAt: '2026-09-01T12:00:00.000Z',
  barbershop: { name: 'Salão Central' },
};

function setup(props: Partial<ComponentProps<typeof UserFormDialog>> = {}) {
  const onClose = vi.fn();
  const onSaved = vi.fn();
  render(
    <UserFormDialog
      open
      mode="create"
      user={null}
      selfUserId="self-1"
      onClose={onClose}
      onSaved={onSaved}
      {...props}
    />,
  );
  return { onClose, onSaved };
}

beforeEach(() => {
  vi.clearAllMocks();
  listBarbershops.mockResolvedValue({ success: true, data: [shop], meta: { total: 1, page: 1, limit: 100, totalPages: 1 } });
});

describe('UserFormDialog', () => {
  it('cria usuário com dados válidos', async () => {
    createUser.mockResolvedValue({ success: true, data: editUser });
    const { onSaved } = setup();
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Nome'), { target: { value: 'Maria Silva' } });
    fireEvent.change(within(dialog).getByLabelText('E-mail'), { target: { value: 'maria@x.com' } });
    fireEvent.change(within(dialog).getByLabelText(/^Senha/), { target: { value: '123456' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Criar usuário' }));
    await waitFor(() =>
      expect(createUser).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Maria Silva', email: 'maria@x.com', password: '123456' }),
      ),
    );
    expect(onSaved).toHaveBeenCalled();
  });

  it('valida senha curta na criação', async () => {
    const { onSaved } = setup();
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Nome'), { target: { value: 'Maria' } });
    fireEvent.change(within(dialog).getByLabelText('E-mail'), { target: { value: 'maria@x.com' } });
    fireEvent.change(within(dialog).getByLabelText(/^Senha/), { target: { value: '123' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Criar usuário' }));
    await waitFor(() => expect(within(dialog).getByText('Mínimo de 6 caracteres.')).toBeInTheDocument());
    expect(createUser).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('bloqueia alterar papel e status da própria conta na edição', async () => {
    setup({ mode: 'edit', user: { ...editUser, id: 'self-1' }, selfUserId: 'self-1' });
    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByRole('combobox', { name: 'Papel' })).toBeDisabled();
    expect(within(dialog).getByLabelText('Conta ativa')).toBeDisabled();
    expect(within(dialog).queryByLabelText('Senha')).not.toBeInTheDocument();
  });

  it('edita usuário e reporta erro da API', async () => {
    updateUser.mockRejectedValueOnce(new Error('LAST_MASTER_ADMIN'));
    setup({ mode: 'edit', user: editUser, selfUserId: 'self-1' });
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Nome'), { target: { value: 'Dono Editado' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(updateUser).toHaveBeenCalled());
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('LAST_MASTER_ADMIN');
  });
});
