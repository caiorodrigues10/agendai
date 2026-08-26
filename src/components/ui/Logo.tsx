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
    text: 'text-[15px] leading-none',
    badge: 'h-[1.45em] min-w-[1.55em] px-[0.28em] rounded-[0.32em]',
    overlap: '-mr-[0.42em]',
    img: 'w-8 h-8 rounded-lg',
  },
  md: {
    text: 'text-[20px] leading-none',
    badge: 'h-[1.45em] min-w-[1.55em] px-[0.3em] rounded-[0.32em]',
    overlap: '-mr-[0.45em]',
    img: 'w-11 h-11 rounded-xl',
  },
  lg: {
    text: 'text-[28px] leading-none',
    badge: 'h-[1.45em] min-w-[1.55em] px-[0.3em] rounded-[0.32em]',
    overlap: '-mr-[0.48em]',
    img: 'w-16 h-16 rounded-2xl',
  },
} as const;

/**
 * AGENDAI — "AGEND" (currentColor) sobrepõe o quadrado teal com "AI".
 */
export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  customImageUrl,
  showText = true,
  className,
}) => {
  const s = sizeMap[size];
  const font = {
    fontFamily: "'Syne', ui-sans-serif, system-ui, sans-serif",
  };

  if (customImageUrl) {
    return (
      <div
        className={`${s.img} overflow-hidden border border-border bg-surface shadow-sm select-none flex items-center justify-center`}
      >
        <img src={customImageUrl} alt="AGENDAI" className="w-full h-full object-contain p-0.5" />
      </div>
    );
  }

  if (!showText) {
    return (
      <span
        className={`${s.text} ${s.badge} inline-flex items-center justify-center font-black tracking-tight text-[#0a0f18] bg-[#00c2b3] shrink-0 select-none`}
        style={font}
        aria-label="AGENDAI"
        role="img"
      >
        AI
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center select-none ${s.text} font-black tracking-[-0.05em] uppercase ${className ?? 'text-text-primary'}`}
      style={font}
      aria-label="AGENDAI"
      role="img"
    >
      <span className={`relative z-10 ${s.overlap} text-current`}>AGEND</span>
      <span
        className={`${s.badge} relative z-0 inline-flex items-center justify-center text-[#0a0f18] bg-[#00c2b3] shrink-0`}
      >
        AI
      </span>
    </span>
  );
};
