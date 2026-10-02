import React from 'react';
import './Skeleton.css';

export interface SkeletonProps {
  className?: string;
  /** Largura CSS (ex.: '100%', '8rem', '40px') */
  width?: string;
  /** Altura CSS (ex.: '1rem', '40px') */
  height?: string;
  /** Formato: retangular (padrão), circular, ou arredondado */
  variant?: 'rect' | 'circle' | 'rounded';
  /** Desabilita animação (respeita prefers-reduced-motion) */
  animate?: boolean;
}

/**
 * Bloco visual de carregamento — sem dependência externa.
 * Temas claro/escuro usam os tokens --ag-surface e --ag-surface-2.
 * Animação: pulsação suave de opacidade (sem faixa brilhante).
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  variant = 'rect',
  animate = true,
}) => {
  const variantClass =
    variant === 'circle'
      ? 'rounded-full'
      : variant === 'rounded'
        ? 'rounded-xl'
        : 'rounded-md';

  return (
    <div
      aria-hidden
      className={`skeleton ${variantClass} ${animate ? 'skeleton--animate' : ''} ${className}`}
      style={{ width, height }}
    />
  );
};

/**
 * Container acessível para estados de carregamento.
 * Recebe `aria-busy` e anuncia status para leitores de tela.
 */
export const SkeletonRegion: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  label?: string;
  className?: string;
}> = ({ loading, children, label = 'Carregando conteúdo', className }) => (
  <div
    aria-busy={loading}
    aria-live={loading ? 'polite' : 'off'}
    className={className}
  >
    {loading && (
      <span className="sr-only">{label}</span>
    )}
    {children}
  </div>
);
