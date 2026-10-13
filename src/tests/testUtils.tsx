import React, { PropsWithChildren } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PwaInstallProvider } from '../contexts/PwaInstallContext';

/** Wrapper leve — ThemeProvider real exige AuthProvider (mockado em setup.ts). */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { route?: string; entryState?: unknown }
) {
  const { route = '/', entryState, ...renderOptions } = options ?? {};
  // A route pode trazer query (?ref=...): o MemoryRouter separa pathname/search.
  const [pathname, search] = route.split('?');

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <MemoryRouter
        initialEntries={[
          { pathname, search: search ? `?${search}` : undefined, state: entryState },
        ]}
      >
        <PwaInstallProvider>{children}</PwaInstallProvider>
      </MemoryRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
