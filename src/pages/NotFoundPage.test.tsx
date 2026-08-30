import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { renderWithProviders } from '../tests/testUtils';
import { NotFoundPage } from './NotFoundPage';

const { authState } = vi.hoisted(() => ({
  authState: { user: null as null | { role: 'OWNER' | 'MASTER_ADMIN' } },
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: authState.user,
    loading: false,
    login: vi.fn(),
    loginWithGoogle: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    hasRole: vi.fn(),
    updateUserAvatar: vi.fn(),
  }),
}));

const LocationProbe = () => <span data-testid="location">{useLocation().pathname}</span>;

function renderUnknownRoute(route = '/endereco-que-nao-existe') {
  return renderWithProviders(
    <>
      <Routes>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <LocationProbe />
    </>,
    { route }
  );
}

describe('NotFoundPage', () => {
  beforeEach(() => {
    authState.user = null;
  });

  it('mantém a URL inválida e oferece início e login para visitantes', () => {
    renderUnknownRoute();

    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument();
    expect(screen.getByText('Erro 404')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/endereco-que-nao-existe');
    expect(screen.getByRole('link', { name: /voltar ao início/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/login');
    expect(document.title).toBe('Página não encontrada | AgendAI');
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow'
    );
  });

  it('direciona usuário autenticado para o painel correspondente', () => {
    authState.user = { role: 'MASTER_ADMIN' };
    renderUnknownRoute('/rota-invalida');

    expect(screen.getByRole('link', { name: 'Ir para o painel' })).toHaveAttribute(
      'href',
      '/master/dashboard'
    );
  });

  it('restaura os metadados ao sair da página', () => {
    document.title = 'AgendAI';
    const { unmount } = renderUnknownRoute();

    unmount();

    expect(document.title).toBe('AgendAI');
    expect(document.head.querySelector('meta[name="robots"]')).not.toBeInTheDocument();
  });
});
