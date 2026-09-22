/// <reference types="vitest/globals" />
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CategoryManager } from './CategoryManager';
import { useCategories } from '../../hooks/useCategories';
import { Category } from '../../infra/categoriesApi';

const mocks = vi.hoisted(() => ({
  user: { role: 'OWNER', barbershopId: 'shop-1' },
  api: { list: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  changed: vi.fn(),
}));
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => ({ user: mocks.user }) }));
vi.mock('../../contexts/BarbershopFiltersContext', () => ({ useBarbershopFilters: () => ({ barbershopId: 'shop-1' }) }));
vi.mock('../../infra/categoriesApi', () => ({ serviceCategoriesApi: mocks.api, expenseCategoriesApi: mocks.api }));

const category: Category = { id: 'cat-1', barbershopId: 'shop-1', name: 'Cabelo', color: '#123456', description: null, icon: null, active: true, createdAt: '', updatedAt: '' };
function Harness({ kind = 'service' }: { kind?: 'service' | 'expense' }) {
  const state = useCategories(kind);
  return <><CategoryManager title="Categorias" linkedLabel="Os registros vinculados" state={state} onChanged={mocks.changed} /><select aria-label="Categoria do registro">{state.categories.map(c => <option key={c.id}>{c.name}</option>)}</select></>;
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.user.role = 'OWNER';
  mocks.api.list.mockResolvedValue([category]);
});
async function open(kind?: 'service' | 'expense') {
  render(<Harness kind={kind} />);
  fireEvent.click(screen.getByRole('button', { name: 'Categorias' }));
  await screen.findByRole('button', { name: 'Nova categoria' });
}
describe('Gestão de categorias', () => {
  it.each(['service', 'expense'] as const)('cria e atualiza as opções sem recarregar (%s)', async kind => {
    mocks.api.create.mockResolvedValue({ ...category, id: 'cat-2', name: 'Unhas', color: null });
    await open(kind);
    fireEvent.click(screen.getByRole('button', { name: 'Nova categoria' }));
    fireEvent.change(screen.getByLabelText('Nome da categoria'), { target: { value: 'Unhas' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar categoria' }));
    await screen.findByRole('option', { name: 'Unhas' });
    expect(mocks.api.create).toHaveBeenCalledWith({ name: 'Unhas', color: null, barbershopId: 'shop-1' });
    expect(mocks.api.list).toHaveBeenCalledTimes(1);
  });
  it('propaga nome e cor na edição', async () => {
    const updated = { ...category, name: 'Cortes', color: '#abcdef' };
    mocks.api.update.mockResolvedValue(updated);
    await open();
    fireEvent.click(screen.getByRole('button', { name: 'Editar Cabelo' }));
    fireEvent.change(screen.getByLabelText('Nome da categoria'), { target: { value: 'Cortes' } });
    fireEvent.change(screen.getByLabelText('Cor'), { target: { value: '#abcdef' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar categoria' }));
    await screen.findByRole('option', { name: 'Cortes' });
    expect(mocks.changed).toHaveBeenCalledWith('cat-1', updated);
    await waitFor(() => expect(screen.getByText('Cortes', { selector: 'span' }).querySelector('[style]')).toHaveStyle({ backgroundColor: '#abcdef' }));
  });
  it('confirma exclusão e informa desvinculação ao consumidor', async () => {
    mocks.api.delete.mockResolvedValue(undefined);
    await open();
    fireEvent.click(screen.getByRole('button', { name: 'Excluir Cabelo' }));
    expect(screen.getByRole('alertdialog')).toHaveTextContent('serão mantidos sem categoria');
    expect(mocks.api.delete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Excluir categoria' }));
    await waitFor(() => expect(mocks.changed).toHaveBeenCalledWith('cat-1', null));
    expect(screen.queryByRole('option', { name: 'Cabelo' })).not.toBeInTheDocument();
  });
  it('mantém categoria e exibe erro se a exclusão falhar', async () => {
    mocks.api.delete.mockRejectedValue(new Error('Falha ao excluir'));
    await open();
    fireEvent.click(screen.getByRole('button', { name: 'Excluir Cabelo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Excluir categoria' }));
    await screen.findByRole('alert');
    expect(screen.getByRole('option', { name: 'Cabelo' })).toBeInTheDocument();
    expect(mocks.changed).not.toHaveBeenCalled();
  });
  it('employee pode consultar, mas não mutar', async () => {
    mocks.user.role = 'EMPLOYEE';
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Categorias' }));
    await screen.findByRole('option', { name: 'Cabelo' });
    expect(screen.queryByRole('button', { name: /Nova categoria|Editar Cabelo|Excluir Cabelo/ })).not.toBeInTheDocument();
  });
  it('owner não altera globais nem categorias de outro salão', async () => {
    mocks.api.list.mockResolvedValue([{ ...category, barbershopId: null }, { ...category, id: 'cat-2', barbershopId: 'shop-2', name: 'Outro' }]);
    await open();
    expect(screen.queryByRole('button', { name: /Editar|Excluir/ })).not.toBeInTheDocument();
  });
  it('master pode editar categorias globais', async () => {
    mocks.user.role = 'MASTER_ADMIN';
    mocks.api.list.mockResolvedValue([{ ...category, barbershopId: null }]);
    await open();
    expect(screen.getByRole('button', { name: 'Editar Cabelo' })).toBeInTheDocument();
  });
  it('permite tentar novamente após falha na carga', async () => {
    mocks.api.list.mockRejectedValueOnce(new Error('Falha na carga')).mockResolvedValueOnce([]);
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Categorias' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    await screen.findByText('Nenhuma categoria cadastrada.');
  });
});
