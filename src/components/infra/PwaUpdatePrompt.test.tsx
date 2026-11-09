/// <reference types="vitest/globals" />
import { act, fireEvent, render, screen } from '@testing-library/react';
import { swStub } from '../../tests/stubs/pwa-register-react';
import { PwaUpdatePrompt } from './PwaUpdatePrompt';

describe('PwaUpdatePrompt (R10)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    swStub.offlineReady = true;
    swStub.needRefresh = false;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('aviso "pronto para uso offline" se dispensa sozinho após 10 s', () => {
    render(<PwaUpdatePrompt />);
    expect(screen.getByText('Agenda Já pronto para uso offline')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(screen.queryByText('Agenda Já pronto para uso offline')).not.toBeInTheDocument();
  });

  test('botão fechar dispensa o aviso imediatamente', () => {
    render(<PwaUpdatePrompt />);
    fireEvent.click(screen.getByRole('button', { name: 'Fechar aviso' }));

    expect(screen.queryByText('Agenda Já pronto para uso offline')).not.toBeInTheDocument();
  });

  test('aviso de estado offline continua visível mesmo após 60 s', () => {
    swStub.offlineReady = false;
    render(<PwaUpdatePrompt />);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByText('Você está offline')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByText('Você está offline')).toBeInTheDocument();
  });

  test('aviso de nova versão permanece até a ação do usuário', () => {
    swStub.offlineReady = false;
    swStub.needRefresh = true;
    render(<PwaUpdatePrompt />);

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByText('Nova versão disponível')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Atualizar' })).toBeInTheDocument();
  });
});
