/// <reference types="vitest/globals" />
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';

const subscription = vi.fn();
const switchBack = vi.fn();
const headerAuth = {
  switchOrigin: null as { barbershopId: string; orgId: string } | null,
  settings: null as { shopName?: string } | null,
};

vi.mock('../../contexts/SubscriptionContext', () => ({
  useSubscription: () => subscription(),
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ switchOrigin: headerAuth.switchOrigin, switchBack }),
}));

vi.mock('../../contexts/BarbershopContext', () => ({
  useBarbershop: () => ({ settings: headerAuth.settings }),
}));

vi.mock('../../components/infra/ThemeToggle', () => ({
  ThemeToggle: () => <button type="button">Tema</button>,
}));

const owner = { id: 'user-1', name: 'Caio', role: 'OWNER' as const, email: 'caio@example.com' };

beforeEach(() => {
  vi.clearAllMocks();
  headerAuth.switchOrigin = null;
  headerAuth.settings = null;
});

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header currentUser={owner} onOpenLogin={vi.fn()} onLogout={vi.fn()} />
    </MemoryRouter>
  );
}

describe('Header', () => {
  it('mostra os dias restantes do trial ativo', () => {
    subscription.mockReturnValue({
      data: { trial: { isInTrial: true, isExpired: false, daysRemainingInTrial: 12 } },
    });

    renderHeader();

    expect(screen.getByLabelText('Seu acesso de teste termina em 12 dias.')).toHaveClass('text-accent');
  });

  it('destaca o trial nos últimos sete e três dias', () => {
    subscription.mockReturnValue({
      data: { trial: { isInTrial: true, isExpired: false, daysRemainingInTrial: 7 } },
    });
    const { rerender } = renderHeader();
    expect(screen.getByLabelText('Seu acesso de teste termina em 7 dias.')).toHaveClass('text-warning');

    subscription.mockReturnValue({
      data: { trial: { isInTrial: true, isExpired: false, daysRemainingInTrial: 3 } },
    });
    rerender(
      <MemoryRouter>
        <Header currentUser={owner} onOpenLogin={vi.fn()} onLogout={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByLabelText('Seu acesso de teste termina em 3 dias.')).toHaveClass('text-danger');
  });

  it('não mostra o indicador após o fim do trial', () => {
    subscription.mockReturnValue({
      data: { trial: { isInTrial: false, isExpired: true, daysRemainingInTrial: 0 } },
    });

    renderHeader();

    expect(screen.queryByLabelText(/Seu acesso de teste termina/)).not.toBeInTheDocument();
  });

  it('sem troca de salão não mostra o aviso do salão ativo', () => {
    subscription.mockReturnValue({ data: null });
    renderHeader();

    expect(screen.queryByTestId('active-shop-notice')).not.toBeInTheDocument();
  });

  it('mostra o nome do salão ativo e o botão "Voltar ao salão original" quando trocou de salão', async () => {
    subscription.mockReturnValue({ data: null });
    headerAuth.switchOrigin = { barbershopId: 'b1', orgId: 'org1' };
    headerAuth.settings = { shopName: 'Salao E2E B' };
    switchBack.mockResolvedValue({ ok: true });

    render(
      <MemoryRouter>
        <Header
          currentUser={{ ...owner, barbershopId: 'b2' }}
          onOpenLogin={vi.fn()}
          onLogout={vi.fn()}
        />
      </MemoryRouter>,
    );

    const notice = screen.getByTestId('active-shop-notice');
    expect(notice).toHaveTextContent('Você está no salão Salao E2E B');

    const button = screen.getByRole('button', { name: 'Voltar ao salão original' });
    fireEvent.click(button);
    await waitFor(() => expect(switchBack).toHaveBeenCalledTimes(1));
  });

  it('não mostra o aviso quando a sessão já está no salão de origem', () => {
    subscription.mockReturnValue({ data: null });
    headerAuth.switchOrigin = { barbershopId: 'b1', orgId: 'org1' };

    render(
      <MemoryRouter>
        <Header
          currentUser={{ ...owner, barbershopId: 'b1' }}
          onOpenLogin={vi.fn()}
          onLogout={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.queryByTestId('active-shop-notice')).not.toBeInTheDocument();
  });
});
