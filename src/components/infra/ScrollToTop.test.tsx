/// <reference types="vitest/globals" />
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { ScrollToTop } from './ScrollToTop';

function NavTarget({ to, label }: { to: string; label: string }) {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(to)}>
      {label}
    </button>
  );
}

function renderAt(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ScrollToTop />
      <NavTarget to="/app/services" label="services" />
      <NavTarget to="/app/settings" label="settings" />
      <NavTarget to="/app/overview" label="overview" />
      <NavTarget to="/" label="home" />
      <NavTarget to="/#precos" label="hash" />
    </MemoryRouter>
  );
}

// Deixa o reset da montagem (jumpToTop + RAF + timeout de 50ms) esvaziar
// antes de medir — senão callbacks pendentes poluem a contagem.
async function flushPendingResets() {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 80));
  });
}

let scrollTo: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
});

afterEach(() => {
  scrollTo.mockRestore();
});

describe('ScrollToTop', () => {
  it('NÃO reseta o scroll ao trocar de aba dentro do /app (services → settings)', async () => {
    renderAt('/app/services');
    await flushPendingResets();
    scrollTo.mockClear();

    fireEvent.click(screen.getByRole('button', { name: 'settings' }));
    await flushPendingResets();

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('reseta o scroll ao entrar no /app a partir do site público (/, → /app/overview)', async () => {
    renderAt('/');
    await flushPendingResets();
    scrollTo.mockClear();

    fireEvent.click(screen.getByRole('button', { name: 'overview' }));
    await flushPendingResets();

    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('reseta o scroll ao sair do /app (/app/overview → /)', async () => {
    renderAt('/app/overview');
    await flushPendingResets();
    scrollTo.mockClear();

    fireEvent.click(screen.getByRole('button', { name: 'home' }));
    await flushPendingResets();

    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('mantém a exceção de hash: navegar para /#precos não dispara o reset', async () => {
    renderAt('/');
    await flushPendingResets();
    scrollTo.mockClear();

    fireEvent.click(screen.getByRole('button', { name: 'hash' }));
    await flushPendingResets();

    expect(scrollTo).not.toHaveBeenCalled();
  });
});
