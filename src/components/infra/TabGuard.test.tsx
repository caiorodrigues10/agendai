/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { TabGuard } from './TabGuard';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useBarbershop } from '../../contexts/BarbershopContext';

vi.mock('../../contexts/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../../contexts/SubscriptionContext', () => ({ useSubscription: vi.fn() }));
vi.mock('../../contexts/BarbershopContext', () => ({ useBarbershop: vi.fn() }));

const PathProbe = () => <div data-testid="path">{useLocation().pathname}</div>;

interface RenderOptions {
  role?: 'OWNER' | 'EMPLOYEE' | 'MASTER_ADMIN';
  permissions?: string[];
  authLoading?: boolean;
  subscriptionLoading?: boolean;
  hasDashboard?: boolean;
}

function renderTab(tab: string, options: RenderOptions = {}) {
  const {
    role = 'OWNER',
    permissions,
    authLoading = false,
    subscriptionLoading = false,
    hasDashboard = true,
  } = options;

  vi.mocked(useAuth).mockReturnValue({
    user: { id: 'u1', role, permissions },
    loading: authLoading,
  } as never);
  vi.mocked(useSubscription).mockReturnValue({
    hasDashboard,
    loading: subscriptionLoading,
  } as never);
  vi.mocked(useBarbershop).mockReturnValue({
    settings: { operationMode: 'HYBRID' },
  } as never);

  return render(
    <MemoryRouter initialEntries={[`/app/${tab}`]}>
      <Routes>
        <Route
          path="/app/:tab"
          element={
            <>
              <PathProbe />
              <TabGuard>
                <div data-testid="conteudo" />
              </TabGuard>
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('TabGuard', () => {
  afterEach(() => vi.clearAllMocks());

  it('OWNER com assinatura carregada abre products', () => {
    renderTab('products', { role: 'OWNER' });

    expect(screen.getByTestId('conteudo')).toBeInTheDocument();
    expect(screen.queryByText('Acesso negado')).not.toBeInTheDocument();
    expect(screen.getByTestId('path')).toHaveTextContent('/app/products');
  });

  it('OWNER com assinatura ainda carregando não mostra "Acesso negado"', () => {
    renderTab('products', { role: 'OWNER', subscriptionLoading: true });

    expect(screen.queryByText('Acesso negado')).not.toBeInTheDocument();
    expect(screen.queryByTestId('conteudo')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('OWNER sem plano Pro é redirecionado para o upgrade (mesmo destino do StaffDashboard)', () => {
    renderTab('products', { role: 'OWNER', hasDashboard: false });

    expect(screen.queryByText('Acesso negado')).not.toBeInTheDocument();
    expect(screen.getByTestId('path')).toHaveTextContent('/app/overview');
    expect(screen.getByTestId('conteudo')).toBeInTheDocument();
  });

  it('OWNER sem plano Pro também redireciona em outras abas com paywall', () => {
    renderTab('reports', { role: 'OWNER', hasDashboard: false });

    expect(screen.queryByText('Acesso negado')).not.toBeInTheDocument();
    expect(screen.getByTestId('path')).toHaveTextContent('/app/overview');
  });

  it('OWNER sem plano Pro não redireciona em abas sem paywall', () => {
    renderTab('clients', { role: 'OWNER', hasDashboard: false });

    expect(screen.getByTestId('path')).toHaveTextContent('/app/clients');
    expect(screen.getByTestId('conteudo')).toBeInTheDocument();
  });

  it('EMPLOYEE sem permissão de products vê "Acesso negado"', () => {
    renderTab('products', { role: 'EMPLOYEE', permissions: ['QUEUE_MANAGE'] });

    expect(screen.getByText('Acesso negado')).toBeInTheDocument();
    expect(screen.queryByTestId('conteudo')).not.toBeInTheDocument();
    expect(screen.getByTestId('path')).toHaveTextContent('/app/products');
  });

  it('EMPLOYEE com permissão de products abre a aba', () => {
    renderTab('products', { role: 'EMPLOYEE', permissions: ['PRODUCTS_VIEW'] });

    expect(screen.getByTestId('conteudo')).toBeInTheDocument();
    expect(screen.queryByText('Acesso negado')).not.toBeInTheDocument();
  });

  it('EMPLOYEE em aba exclusiva do dono continua negada (equipe)', () => {
    renderTab('team', { role: 'EMPLOYEE', permissions: ['PRODUCTS_VIEW'] });

    expect(screen.getByText('Acesso negado')).toBeInTheDocument();
    expect(screen.queryByTestId('conteudo')).not.toBeInTheDocument();
  });
});
