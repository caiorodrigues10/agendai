/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { UsersPage } from './UsersPage';
import { adminApi, UserListItem } from '../../infra/adminApi';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'self-1', name: 'Admin', email: 'a@a.com', role: 'MASTER_ADMIN' } }),
}));

vi.mock('../../infra/adminApi', () => ({
  adminApi: {
    listUsers: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    listBarbershops: vi.fn(),
  },
}));

const listUsers = vi.mocked(adminApi.listUsers);
const createUser = vi.mocked(adminApi.createUser);
const deleteUser = vi.mocked(adminApi.deleteUser);
const listBarbershops = vi.mocked(adminApi.listBarbershops);

const buildUser = (overrides: Partial<UserListItem> = {}): UserListItem => ({
  id: 'u-1',
  name: 'Dono Teste',
  email: 'dono@x.com',
  role: 'OWNER',
  active: true,
  barbershopId: 'shop-1',
  createdAt: '2026-09-01T12:00:00.000Z',
  barbershop: { name: 'Salão Central' },
  ...overrides,
});

const meta = { total: 1, page: 1, limit: 20, totalPages: 1 };

function mockList(items: UserListItem[]) {
  listUsers.mockResolvedValue({ success: true, data: items, meta: { ...meta, total: items.length } });
}

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listBarbershops.mockResolvedValue({
      success: true,
      data: [],
      meta: { total: 0, page: 1, limit: 100, totalPages: 0 },
    });
  });

  it('carrega e renderiza a lista de usuários', async () => {
    mockList([buildUser(), buildUser({ id: 'self-1', name: 'Eu Mesmo', email: 'me@x.com' })]);
    render(<UsersPage />);
    expect(await screen.findByText('Dono Teste')).toBeInTheDocument();
    expect(screen.getByText('(você)')).toBeInTheDocument();
    expect(listUsers).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 20 }));
  });

  it('filtra por papel e status', async () => {
    mockList([]);
    render(<UsersPage />);
    await screen.findByText('Nenhum usuário encontrado com estes filtros.');
    fireEvent.change(screen.getByLabelText('Papel'), { target: { value: 'EMPLOYEE' } });
    await waitFor(() =>
      expect(listUsers).toHaveBeenLastCalledWith(expect.objectContaining({ role: 'EMPLOYEE' })),
    );
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'false' } });
    await waitFor(() =>
      expect(listUsers).toHaveBeenLastCalledWith(expect.objectContaining({ active: false })),
    );
  });

  it('busca por nome no formulário', async () => {
    mockList([]);
    render(<UsersPage />);
    await screen.findByText('Nenhum usuário encontrado com estes filtros.');
    fireEvent.change(screen.getByLabelText('Buscar usuários'), { target: { value: 'maria' } });
    fireEvent.submit(screen.getByLabelText('Buscar usuários').closest('form')!);
    await waitFor(() =>
      expect(listUsers).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'maria' })),
    );
  });

  it('exibe erro com botão de tentar novamente', async () => {
    listUsers.mockRejectedValueOnce(new Error('boom'));
    listUsers.mockResolvedValueOnce({ success: true, data: [], meta });
    render(<UsersPage />);
    expect(await screen.findByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => expect(listUsers).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('Nenhum usuário encontrado com estes filtros.')).toBeInTheDocument();
  });

  it('não permite excluir a própria conta', async () => {
    mockList([buildUser({ id: 'self-1', name: 'Eu Mesmo' })]);
    render(<UsersPage />);
    const deleteButton = await screen.findByRole('button', { name: 'Excluir Eu Mesmo' });
    expect(deleteButton).toBeDisabled();
  });

  it('exclui usuário após confirmação', async () => {
    mockList([buildUser()]);
    deleteUser.mockResolvedValue({ success: true, message: 'ok' });
    render(<UsersPage />);
    await screen.findByText('Dono Teste');
    fireEvent.click(screen.getByRole('button', { name: 'Excluir Dono Teste' }));
    const alert = await screen.findByRole('alertdialog');
    fireEvent.click(within(alert).getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(deleteUser).toHaveBeenCalledWith('u-1'));
    await waitFor(() => expect(listUsers).toHaveBeenCalledTimes(2));
  });

  it('abre o diálogo de criação e envia o formulário', async () => {
    mockList([]);
    createUser.mockResolvedValue({ success: true, data: buildUser({ id: 'novo' }) });
    render(<UsersPage />);
    await screen.findByText('Nenhum usuário encontrado com estes filtros.');
    fireEvent.click(screen.getByRole('button', { name: /Novo usuário/ }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Novo usuário')).toBeInTheDocument();
    fireEvent.submit(document.getElementById('user-form')!);
    await waitFor(() =>
      expect(within(dialog).getByText('Informe o nome.')).toBeInTheDocument(),
    );
    expect(createUser).not.toHaveBeenCalled();
  });
});
