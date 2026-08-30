import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';
import { logger } from '../../utils/logger';

vi.mock('../../utils/logger', () => ({
  logger: { error: vi.fn() },
}));

const BrokenPage = () => {
  throw new Error('detalhe interno que não deve aparecer');
};

describe('ErrorBoundary', () => {
  it('mostra o estado 500 sem expor detalhes internos', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const preventExpectedError = (event: ErrorEvent) => event.preventDefault();
    window.addEventListener('error', preventExpectedError);

    render(
      <ErrorBoundary>
        <BrokenPage />
      </ErrorBoundary>
    );

    expect(
      screen.getByRole('heading', { name: 'Algo não saiu como esperado' })
    ).toBeInTheDocument();
    expect(screen.getByText('Erro 500')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /recarregar página/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /voltar ao início/i })).toHaveAttribute('href', '/');
    expect(screen.queryByText(/detalhe interno/i)).not.toBeInTheDocument();
    expect(logger.error).toHaveBeenCalledOnce();

    window.removeEventListener('error', preventExpectedError);
    consoleError.mockRestore();
  });
});
