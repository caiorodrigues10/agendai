import React from 'react';
import { useOptionalTheme } from '../../contexts/ThemeContext';

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
 * AGENDA JÁ — Marca visual com ícone de calendário + texto.
 */
export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  customImageUrl,
  showText = true,
  className,
}) => {
  const s = sizeMap[size];
  const theme = useOptionalTheme();

  if (customImageUrl) {
    return (
      <div
        className={`${s.iconOnly} overflow-hidden border border-border bg-surface shadow-sm select-none flex items-center justify-center`}
      >
        <img src={customImageUrl} alt="Agenda Já" className="w-full h-full object-contain p-0.5" />
      </div>
    );
  }

  if (!showText) {
    return (
      <img
        src="/favicon.png"
        alt="Agenda Já"
        width={128}
        height={128}
        loading="lazy"
        decoding="async"
        className={`${s.iconOnly} select-none object-contain`}
      />
    );
  }

  const logoSrc = theme === 'light' ? '/brand/agendai-logo.webp' : '/brand/agendai-logo-dark.webp';

  return (
    <span className={`inline-flex select-none ${className ?? ''}`}>
      <img
        src={logoSrc}
        alt="Agenda Já"
        width={700}
        height={145}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className={`${s.img} w-auto object-contain`}
      />
    </span>
  );
};
