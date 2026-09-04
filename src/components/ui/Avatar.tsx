import React, { useState } from 'react';

type AvatarSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  className?: string;
}

const SIZE_MAP: Record<AvatarSize, { container: string; text: string }> = {
  xxs: { container: 'w-6 h-6', text: 'text-[8px]' },
  xs: { container: 'w-8 h-8', text: 'text-[10px]' },
  sm: { container: 'w-10 h-10', text: 'text-xs' },
  md: { container: 'w-14 h-14', text: 'text-sm' },
  lg: { container: 'w-24 h-24', text: 'text-xl' },
};

const COLORS = [
  'bg-accent/20 text-accent',
  'bg-blue-500/20 text-blue-400',
  'bg-purple-500/20 text-purple-400',
  'bg-amber-500/20 text-amber-400',
  'bg-rose-500/20 text-rose-400',
  'bg-cyan-500/20 text-cyan-400',
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getColorClass(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', className = '' }) => {
  const { container, text } = SIZE_MAP[size];
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <div className={`${container} rounded-full overflow-hidden shrink-0 ${className}`}>
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${container} rounded-full shrink-0 flex items-center justify-center font-bold ${text} ${getColorClass(name)} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};
