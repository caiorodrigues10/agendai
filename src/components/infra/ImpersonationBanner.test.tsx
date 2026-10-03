/// <reference types="vitest/globals" />
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ImpersonationBanner } from './ImpersonationBanner';
import { useAuth } from '../../contexts/AuthContext';
import { impersonationStorage } from '../../infra/impersonationStorage';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const exitImpersonation = vi.fn();

function renderBanner(shop: { id: string; name: string } | null) {
  vi.mocked(useAuth).mockReturnValue({
    impersonationShop: shop,
    exitImpersonation,
  } as never);
  return render(
    <MemoryRouter initialEntries={['/master/accounts/shop-1']}>
      <ImpersonationBanner />
      <Routes>
        <Route path="/master/accounts/:id" element={<div>detalhe-conta</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ImpersonationBanner', () => {
  afterEach(() => {
    vi.clearAllMocks();
    impersonationStorage.clear();
    vi.useRealTimers();
  });

  it('não renderiza sem sessão de impersonation', () => {
    renderBanner(null);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('mostra o salão e a regressiva de 30min', () => {
    vi.useFakeTimers();
    impersonationStorage.start({
      accessToken: 'imp-token',
      expiresIn: 1800,
      user: {},
      shop: { id: 'shop-1', name: 'Barbearia Central' },
    });

    renderBanner({ id: 'shop-1', name: 'Barbearia Central' });
    act(() => vi.advanceTimersByTime(0));

    expect(screen.getByRole('status')).toHaveTextContent('Barbearia Central');
    expect(screen.getByText('expira em 30:00')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(61_000));
    expect(screen.getByText('expira em 28:59')).toBeInTheDocument();
  });

  it('encerra a sessão e volta para o detalhe da conta', () => {
    vi.useFakeTimers();
    impersonationStorage.start({
      accessToken: 'imp-token',
      expiresIn: 1800,
      user: {},
      shop: { id: 'shop-1', name: 'Barbearia Central' },
    });

    renderBanner({ id: 'shop-1', name: 'Barbearia Central' });
    fireEvent.click(screen.getByRole('button', { name: 'Encerrar' }));

    expect(exitImpersonation).toHaveBeenCalledTimes(1);
    expect(screen.getByText('detalhe-conta')).toBeInTheDocument();
  });

  it('encerra sozinha quando o token expira', () => {
    vi.useFakeTimers();
    impersonationStorage.start({
      accessToken: 'imp-token',
      expiresIn: 1,
      user: {},
      shop: { id: 'shop-1', name: 'Barbearia Central' },
    });

    renderBanner({ id: 'shop-1', name: 'Barbearia Central' });
    act(() => vi.advanceTimersByTime(2_000));

    expect(exitImpersonation).toHaveBeenCalledTimes(1);
  });
});
