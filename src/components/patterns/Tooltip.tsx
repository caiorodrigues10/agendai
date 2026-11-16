import React, { useCallback, useId, useState } from 'react';
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react';

export interface TooltipProps {
  label: React.ReactNode;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  placement?: 'top' | 'bottom';
  className?: string;
}

/**
 * Hover/focus tooltip.
 *
 * Positioning is delegated to `@floating-ui` (`shift` keeps the bubble inside
 * the viewport when the trigger sits near an edge) and the bubble wraps at a
 * viewport-relative max width, so a long label never overflows a narrow
 * screen.
 */
export const Tooltip: React.FC<TooltipProps> = ({
  label,
  children,
  placement = 'top',
  className = '',
}) => {
  const id = useId();
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles } = useFloating({
    placement,
    open,
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
  });

  // Callback refs estáveis (os setters do floating-ui são estáveis): o acesso
  // a `refs` acontece no commit, nunca durante o render.
  const setReference = useCallback((node: HTMLElement | null) => {
    refs.setReference(node);
  }, [refs]);
  const setFloating = useCallback((node: HTMLSpanElement | null) => {
    refs.setFloating(node);
  }, [refs]);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- interação real é do filho (foco/hover); wrapper só abre o bubble
    <span
      ref={setReference}
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
          ref={setFloating}
          role="tooltip"
          style={floatingStyles}
          className="pointer-events-none z-50 w-max max-w-[calc(100vw-2rem)] break-words whitespace-normal rounded-lg border border-border bg-bg px-2 py-1 text-xs font-medium text-text-primary shadow-lg"
        >
          {label}
        </span>
      )}
    </span>
  );
};
