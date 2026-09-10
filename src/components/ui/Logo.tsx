import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  customImageUrl?: string;
  showText?: boolean;
  /** Classes extras (ex.: cor via `currentColor` no trecho AGEND). */
  className?: string;
}

const sizeMap = {
  sm: {
    img: 'h-7',
    iconOnly: 'w-8 h-8 rounded-lg',
  },
  md: {
    img: 'h-9',
    iconOnly: 'w-11 h-11 rounded-xl',
  },
  lg: {
    img: 'h-14',
    iconOnly: 'w-16 h-16 rounded-2xl',
  },
} as const;

/**
 * AGENDAI — Marca visual com ícone de calendário + texto.
 */
export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  customImageUrl,
  showText = true,
  className,
}) => {
  const s = sizeMap[size];

  if (customImageUrl) {
    return (
      <div
        className={`${s.iconOnly} overflow-hidden border border-border bg-surface shadow-sm select-none flex items-center justify-center`}
      >
        <img src={customImageUrl} alt="AGENDAI" className="w-full h-full object-contain p-0.5" />
      </div>
    );
  }

  if (!showText) {
    return (
      <img
        src="/favicon.svg"
        alt="AGENDAI"
        className={`${s.iconOnly} select-none object-contain`}
      />
    );
  }

  return (
    <img
      src="/brand/agendai-logo.png"
      alt="AGENDAI"
      className={`${s.img} select-none object-contain ${className ?? ''}`}
      onError={(e) => {
        // Fallback para SVG se PNG não carregar
        (e.target as HTMLImageElement).src = '/brand/agendai-logo.svg';
      }}
    />
  );
};
