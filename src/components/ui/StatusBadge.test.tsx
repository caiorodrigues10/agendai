import { render, screen } from '@testing-library/react';
import { LuTriangleAlert as AlertTriangle } from 'react-icons/lu';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renderiza o texto como rótulo e aplica o tom semântico', () => {
    render(<StatusBadge tone="success">ok</StatusBadge>);

    const badge = screen.getByText('ok');
    expect(badge).toHaveClass('text-success');
    expect(badge).toHaveClass('border-success/30', 'bg-success/10');
  });

  it('mantém o mesmo layout-base em qualquer tom (altura fixa e texto centralizado)', () => {
    render(<StatusBadge tone="danger">zerado</StatusBadge>);

    const badge = screen.getByText('zerado');
    expect(badge).toHaveClass(
      'inline-flex',
      'h-6',
      'items-center',
      'gap-1.5',
      'rounded-full',
      'px-2.5',
      'text-xs',
      'font-bold',
      'leading-none',
      'whitespace-nowrap',
    );
  });

  it('ícone é decorativo, sem encolher e no tamanho único de 14px', () => {
    const { container } = render(
      <StatusBadge tone="warning" icon={AlertTriangle}>
        estoque baixo
      </StatusBadge>,
    );

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveClass('shrink-0');
    expect(svg).toHaveAttribute('width', '14');
    expect(svg).toHaveAttribute('height', '14');
    expect(screen.getByText('estoque baixo')).toBeInTheDocument();
  });

  it('aceita status/labels legados (sem children)', () => {
    render(<StatusBadge status="RESERVED" labels={{ RESERVED: 'Reservado' }} tone="accent" />);
    expect(screen.getByText('Reservado')).toBeInTheDocument();
  });

  it('className extra entra por último (ex.: mt-1 fora do fluxo)', () => {
    render(
      <StatusBadge tone="danger" className="mt-1">
        Esgotado
      </StatusBadge>,
    );
    expect(screen.getByText('Esgotado')).toHaveClass('mt-1');
  });
});
