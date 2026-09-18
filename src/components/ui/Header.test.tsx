/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';

const subscription = vi.fn();

vi.mock('../../contexts/SubscriptionContext', () => ({
  useSubscription: () => subscription(),
}));

vi.mock('./ThemeToggle', () => ({
  ThemeToggle: () => <button type="button">Tema</button>,
}));

const owner = { id: 'user-1', name: 'Caio', role: 'OWNER' as const, email: 'caio@example.com' };

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
});
