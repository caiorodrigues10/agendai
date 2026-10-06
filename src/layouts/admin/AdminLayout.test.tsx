/// <reference types="vitest/globals" />
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'm-1', name: 'Admin', email: 'admin@admin.com', role: 'MASTER_ADMIN' },
    logout: vi.fn(),
  }),
}));

const renderLayout = () =>
  render(
    <MemoryRouter initialEntries={['/master/overview']}>
      <Routes>
        <Route path="/master" element={<AdminLayout />}>
          <Route path="overview" element={<h1>Visão geral</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('AdminLayout', () => {
  it('mantém um único h1: o título da página, não o rótulo do layout', () => {
    renderLayout();

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Visão geral');
  });

  it('mantém o rótulo do top bar visível, mas fora da hierarquia de headings', () => {
    renderLayout();

    const label = screen.getByText('Painel Interno');
    expect(label).toBeVisible();
    expect(label.closest('h1')).toBeNull();
    expect(label.closest('h2')).toBeNull();
  });

  it('nomeia os botões só-ícone de abrir e fechar o menu lateral', () => {
    renderLayout();

    const open = screen.getByRole('button', { name: 'Abrir menu' });
    fireEvent.click(open);

    // Botão de fechar no topo da sidebar + fundo clicável.
    expect(screen.getAllByRole('button', { name: 'Fechar menu' })).toHaveLength(2);
  });

  it('fecha o menu lateral pelo teclado (Escape)', () => {
    renderLayout();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    expect(screen.getAllByRole('button', { name: 'Fechar menu' })).toHaveLength(2);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.getAllByRole('button', { name: 'Fechar menu' })).toHaveLength(1);
  });
});
