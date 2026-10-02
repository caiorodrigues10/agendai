/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('renderiza rótulo, valor e dica', () => {
    render(<StatCard label="Agendamentos" value="128" hint="meta 150" />);
    expect(screen.getByText('Agendamentos')).toBeInTheDocument();
    expect(screen.getByText('128')).toBeInTheDocument();
    expect(screen.getByText('meta 150')).toBeInTheDocument();
  });

  it('renderiza delta positivo com classe de sucesso', () => {
    const { container } = render(
      <StatCard label="Faturamento" value="R$ 4.280" delta={{ label: '+12%', direction: 'up' }} />
    );
    const delta = screen.getByText('+12%');
    expect(delta).toHaveClass('text-success');
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renderiza delta negativo com classe de perigo', () => {
    render(
      <StatCard label="Cancelamentos" value="7" delta={{ label: '-3', direction: 'down' }} />
    );
    expect(screen.getByText('-3')).toHaveClass('text-danger');
  });

  it('omite blocos opcionais quando não fornecidos', () => {
    const { container } = render(<StatCard label="Ocupação" value="82%" />);
    expect(container.querySelector('svg')).toBeNull();
    expect(container.textContent).not.toContain('meta');
  });
});
