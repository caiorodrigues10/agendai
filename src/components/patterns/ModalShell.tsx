import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import FocusLock from 'react-focus-lock';
import { LuX as X } from 'react-icons/lu';

export interface ModalShellProps {
  open: boolean;
  title: React.ReactNode;
  titleId: string;
  role?: 'dialog' | 'alertdialog';
  icon?: React.ReactNode;
  iconClassName?: string;
  borderClassName?: string;
  loading?: boolean;
  closeOnEscape?: boolean;
  onClose: () => void;
  className?: string;
  children?: React.ReactNode;
  body?: React.ReactNode;
  footer?: React.ReactNode;
}

export const ModalShell: React.FC<ModalShellProps> = ({
  open,
  title,
  titleId,
  role = 'dialog',
  icon,
  iconClassName = 'bg-accent/15 text-accent',
  borderClassName = 'border-border',
  loading = false,
  closeOnEscape = true,
  onClose,
  className = '',
  children,
  body,
  footer,
}) => {
  useEffect(() => {
    if (!open || !closeOnEscape || loading) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeOnEscape, loading, onClose]);

  if (!open) return null;

  return createPortal(
    <FocusLock returnFocus>
      <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/70 p-4 sm:items-center">
        <button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="absolute inset-0 cursor-default"
        />
        <div
          role={role}
          aria-modal="true"
          aria-labelledby={titleId}
          className={`relative w-full max-w-md rounded-2xl border ${borderClassName} bg-surface p-5 shadow-2xl ${className}`}
        >
          <div className="flex items-start gap-3">
            {icon && <div className={`shrink-0 rounded-xl p-2 ${iconClassName}`}>{icon}</div>}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 id={titleId} className="font-bold text-text-primary">
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="rounded-lg p-1 text-text-muted hover:bg-bg disabled:opacity-50"
                  aria-label="Fechar"
                >
                  <X size={16} />
                </button>
              </div>
              {children}
            </div>
          </div>
          {body && <div className="mt-4">{body}</div>}
          {footer && <div className="mt-5 flex gap-2">{footer}</div>}
        </div>
      </div>
    </FocusLock>,
    document.body
  );
};
