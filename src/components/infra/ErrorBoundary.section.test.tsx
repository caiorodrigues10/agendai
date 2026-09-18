/// <reference types="vitest/globals" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

const BrokenSection = () => {
  throw new Error('lista paginada');
};

describe('ErrorBoundary section', () => {
  it('isola a falha sem substituir a tela inteira por 500', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const preventExpectedError = (event: ErrorEvent) => event.preventDefault();
    window.addEventListener('error', preventExpectedError);

    render(
      <div>
        <p>Resumo financeiro</p>
        <ErrorBoundary variant="section">
          <BrokenSection />
        </ErrorBoundary>
      </div>
    );

    expect(screen.getByText('Resumo financeiro')).toBeTruthy();
    expect(screen.getByText('Não foi possível carregar esta seção')).toBeTruthy();
    expect(screen.queryByText('Erro 500')).toBeNull();
    expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeTruthy();

    window.removeEventListener('error', preventExpectedError);
    consoleError.mockRestore();
  });
});
