import React from 'react';
import { render, screen } from '@testing-library/react';
import { Loader } from '../components/ui/Loader';

describe('Loader (components/ui/Loader.tsx) — ITEM 4', () => {
  it('não renderiza texto visível "Carregando..." (LCP da rota pública)', () => {
    const { container } = render(<Loader />);
    const visible = Array.from(container.querySelectorAll('p,span,div')).filter(
      el =>
        el.childElementCount === 0 &&
        el.textContent?.trim() === 'Carregando...' &&
        !el.className.includes('sr-only')
    );
    expect(visible).toHaveLength(0);
  });

  it('expõe status acessível com aria-busy e rótulo sr-only', () => {
    render(<Loader />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveAccessibleName('Carregando');
    expect(screen.getByText('Carregando…')).toHaveClass('sr-only');
  });

  it('reserva altura com blocos skeleton (sem layout shift no swap)', () => {
    const { container } = render(<Loader />);
    const skeletons = container.querySelectorAll('.skeleton');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });
});
