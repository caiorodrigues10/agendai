import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FloatingPathsBackgroundProps {
  position: number;
  className?: string;
  children?: React.ReactNode;
}

export function FloatingPathsBackground({
  position,
  children,
  className,
}: FloatingPathsBackgroundProps) {
  const paths = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
          380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
          152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
          684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        width: 0.5 + i * 0.03,
        duration: 22 + (i % 7) * 1.4,
      })),
    [position]
  );

  return (
    <div className={cn('relative w-full', className)}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <svg
          className="h-full w-full text-accent-light/80"
          viewBox="0 0 696 316"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          {paths.map(path => (
            <motion.path
              key={path.id}
              d={path.d}
              stroke="currentColor"
              strokeWidth={path.width}
              strokeOpacity={0.08 + path.id * 0.018}
              initial={{ pathLength: 0.3, opacity: 0.45 }}
              animate={{
                pathLength: 1,
                opacity: [0.2, 0.55, 0.2],
                pathOffset: [0, 1, 0],
              }}
              transition={{
                duration: path.duration,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
              }}
            />
          ))}
        </svg>
      </div>
      {children}
    </div>
  );
}
