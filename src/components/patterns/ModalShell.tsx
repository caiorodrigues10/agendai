import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import FocusLock from 'react-focus-lock';
import { LuX as X } from 'react-icons/lu';

export type ModalShellVariant = 'dialog' | 'sheet';

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
  /**
   * `dialog` (padrão): painel centrado `max-w-md` com padding interno.
   * `sheet`: bottom-sheet `max-w-2xl` (colado na base no mobile), header fixo
   * com `border-b` e corpo rolável (`flex-1 overflow-y-auto`).
   */
  variant?: ModalShellVariant;
  /**
   * Nome acessível estável do diálogo (`aria-label`); quando presente o
   * `aria-labelledby` não é emitido. Útil enquanto o `title` ainda carrega.
   */
  ariaLabel?: string;
  /** Slot de ações ao lado do botão de fechar (ex.: WhatsApp/Agendar). */
  actions?: React.ReactNode;
  children?: React.ReactNode;
  body?: React.ReactNode;
  /** Classes extras no container do `body` (complementa `mt-4` ou o scroller do sheet). */
  bodyClassName?: string;
  footer?: React.ReactNode;
}

interface HeaderProps {
  sheet: boolean;
  icon?: React.ReactNode;
  iconClassName: string;
  titleId: string;
  title: React.ReactNode;
  actions?: React.ReactNode;
  loading: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

const ShellHeader: React.FC<HeaderProps> = ({
  sheet,
  icon,
  iconClassName,
  titleId,
  title,
  actions,
  loading,
  onClose,
  children,
}) => (
  <div className="flex items-start gap-3">
    {icon && <div className={`shrink-0 rounded-xl p-2 ${iconClassName}`}>{icon}</div>}
    <div className="flex-1 min-w-0">
      <div className={`flex items-start justify-between ${sheet ? 'gap-3' : 'gap-2'}`}>
        {sheet ? (
          <div id={titleId} className="min-w-0 flex-1">
            {title}
          </div>
        ) : (
          <h3 id={titleId} className="font-bold text-text-primary">
            {title}
          </h3>
        )}
        <div className="flex shrink-0 items-center gap-1">
          {actions}
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={`rounded-lg text-text-muted hover:bg-bg disabled:opacity-50 ${sheet ? 'p-2' : 'p-1'}`}
            aria-label="Fechar"
          >
            <X size={sheet ? 18 : 16} />
          </button>
        </div>
      </div>
      {children}
    </div>
  </div>
);

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
  variant = 'dialog',
  ariaLabel,
  actions,
  children,
  body,
  bodyClassName = '',
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
  const sheet = variant === 'sheet';
  const headerProps = { sheet, icon, iconClassName, titleId, title, actions, loading, onClose, children };

  return createPortal(
    <FocusLock returnFocus>
      <div
        className={`fixed inset-0 z-[110] flex items-end justify-center bg-black/70 ${sheet ? 'sm:p-4' : 'p-4'} sm:items-center`}
      >
        <button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="absolute inset-0 cursor-default"
        />
        <div
          role={role}
          aria-modal="true"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabel ? undefined : titleId}
          className={`relative w-full border ${borderClassName} bg-surface shadow-2xl ${
            sheet
              ? 'flex max-h-[92dvh] flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl max-w-2xl'
              : 'rounded-2xl p-5 max-w-md'
          } ${className}`}
        >
          {sheet ? (
            <header className="shrink-0 border-b border-border px-4 py-4 sm:px-5">
              <ShellHeader {...headerProps} />
            </header>
          ) : (
            <ShellHeader {...headerProps} />
          )}
          {body && (
            <div
              className={`${sheet ? 'flex-1 overflow-y-auto ag-scroll px-4 py-4 sm:px-5' : 'mt-4'} ${bodyClassName}`}
            >
              {body}
            </div>
          )}
          {footer && (
            <div
              className={`flex gap-2 ${sheet ? 'shrink-0 border-t border-border px-4 py-3 sm:px-5' : 'mt-5'}`}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </FocusLock>,
    document.body
  );
};
