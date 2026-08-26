import React, { PropsWithChildren } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/** Wrapper leve — ThemeProvider real exige AuthProvider (mockado em setup.ts). */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { route?: string }
) {
  const { route = '/', ...renderOptions } = options ?? {};

  function Wrapper({ children }: PropsWithChildren) {
    return <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
