import React, { useId, useState } from 'react';

export interface TooltipProps {
  label: React.ReactNode;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  placement?: 'top' | 'bottom';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  label,
  children,
  placement = 'top',
  className = '',
}) => {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- interação real é do filho (foco/hover); wrapper só abre o bubble
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {React.cloneElement(children, { 'aria-describedby': open ? id : undefined })}
      {open && (
        <span
          id={id}
          role="tooltip"
          className={`pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-bg px-2 py-1 text-xs font-medium text-text-primary shadow-lg ${
            placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          {label}
        </span>
      )}
    </span>
  );
};
