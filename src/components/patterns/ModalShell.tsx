import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import FocusLock from 'react-focus-lock';
import { AnimatePresence, motion } from 'framer-motion';
import { LuX as X } from 'react-icons/lu';
import { useVisualViewport } from '../../hooks/useVisualViewport';
import { prefersReducedMotion } from '../../utils/reducedMotion';

// Reference-counted so closing a nested dialog doesn't unlock the page behind it.
const openDialogs: symbol[] = [];
let previousBodyOverflow = '';

export type ModalShellVariant = 'dialog' | 'sheet' | 'fullscreen';

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
   * `fullscreen`: painel em `100dvw × 100dvh`, com header compacto e toolbar
   * horizontal rolável; não usa max-width nem cantos arredondados.
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
  /** Evita que o primeiro campo abra o teclado automaticamente em telas touch. */
  initialFocus?: 'first-control' | 'close-button';
  /** Executado depois da animação de saída do modal fullscreen. */
  onExitComplete?: () => void;
  footer?: React.ReactNode;
}

interface HeaderProps {
  variant: ModalShellVariant;
  icon?: React.ReactNode;
  iconClassName: string;
  titleId: string;
  title: React.ReactNode;
  actions?: React.ReactNode;
  loading: boolean;
  onClose: () => void;
  closeButtonRef: React.RefObject<HTMLButtonElement | null>;
  children?: React.ReactNode;
}

const ShellHeader: React.FC<HeaderProps> = ({
  variant,
  icon,
  iconClassName,
  titleId,
  title,
  actions,
  loading,
  onClose,
  closeButtonRef,
  children,
}) => {
  const closeButton = (
    <button
      ref={closeButtonRef}
      type="button"
      onClick={onClose}
      disabled={loading}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
      aria-label="Fechar"
    >
      <X size={variant === 'dialog' ? 16 : 18} />
    </button>
  );

  if (variant === 'fullscreen') {
    return (
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h3 id={titleId} className="shrink-0 text-sm font-bold text-text-primary">
            {title}
          </h3>
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overscroll-x-contain">
            {actions}
          </div>
          {closeButton}
        </div>
        {children}
      </div>
    );
  }

  const sheet = variant === 'sheet';
  return (
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
            {closeButton}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

interface FullscreenModalPortalProps {
  open: boolean;
  title: React.ReactNode;
  titleId: string;
  role: 'dialog' | 'alertdialog';
  ariaLabel?: string;
  className: string;
  loading: boolean;
  onClose: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  body?: React.ReactNode;
  bodyClassName: string;
  footer?: React.ReactNode;
  closeButtonRef: React.RefObject<HTMLButtonElement | null>;
  overlayStyle?: React.CSSProperties;
  onExitComplete?: () => void;
}

function FullscreenModalPortal({
  open,
  title,
  titleId,
  role,
  ariaLabel,
  className,
  loading,
  onClose,
  actions,
  children,
  body,
  bodyClassName,
  footer,
  closeButtonRef,
  overlayStyle,
  onExitComplete,
}: FullscreenModalPortalProps) {
  const reducedMotion = prefersReducedMotion();
  const duration = reducedMotion ? 0 : 0.14;
  const headerProps = {
    variant: 'fullscreen' as const,
    icon: undefined,
    iconClassName: '',
    titleId,
    title,
    actions,
    loading,
    onClose,
    closeButtonRef,
    children,
  };

  return createPortal(
    <AnimatePresence onExitComplete={onExitComplete}>
      {open && (
        <motion.div
          key="fullscreen-modal"
          className="fixed left-0 top-0 z-[110] flex h-[100dvh] w-[100dvw] bg-media-overlay/80 backdrop-blur-md"
          style={overlayStyle}
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration }}
        >
          <button
            type="button"
            aria-label="Fechar"
            tabIndex={-1}
            aria-hidden="true"
            disabled={loading}
            onClick={onClose}
            className="absolute inset-0 cursor-default"
          />
          <FocusLock returnFocus className="h-full min-h-0 w-full min-w-0">
            <motion.div
              role={role}
              aria-modal="true"
              aria-label={ariaLabel}
              aria-labelledby={ariaLabel ? undefined : titleId}
              className={`relative flex h-full w-full flex-col overflow-hidden border-0 bg-surface/95 shadow-2xl backdrop-blur-xl pt-[env(safe-area-inset-top,0px)] pr-[env(safe-area-inset-right,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] ${className}`}
              initial={reducedMotion ? false : { scale: 0.98 }}
              animate={{ scale: 1 }}
              exit={reducedMotion ? { scale: 1 } : { scale: 0.98 }}
              transition={{ duration }}
            >
              <header className="shrink-0 border-b border-border bg-surface/95 px-4 py-3">
                <ShellHeader {...headerProps} />
              </header>
              {body && (
                <div
                  className={`min-h-0 flex-1 overflow-hidden bg-media-overlay/20 ${bodyClassName}`}
                >
                  {body}
                </div>
              )}
              {footer && (
                <div className="flex shrink-0 gap-2 border-t border-border px-4 py-3">{footer}</div>
              )}
            </motion.div>
          </FocusLock>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

interface StandardModalPortalProps {
  titleId: string;
  role: 'dialog' | 'alertdialog';
  ariaLabel?: string;
  borderClassName: string;
  className: string;
  loading: boolean;
  onClose: () => void;
  variant: 'dialog' | 'sheet';
  headerProps: React.ComponentProps<typeof ShellHeader>;
  body?: React.ReactNode;
  bodyClassName: string;
  footer?: React.ReactNode;
  overlayStyle?: React.CSSProperties;
  panelStyle?: React.CSSProperties;
}

function StandardModalPortal({
  titleId,
  role,
  ariaLabel,
  borderClassName,
  className,
  loading,
  onClose,
  variant,
  headerProps,
  body,
  bodyClassName,
  footer,
  overlayStyle,
  panelStyle,
}: StandardModalPortalProps) {
  const sheet = variant === 'sheet';
  return createPortal(
    <FocusLock returnFocus>
      <div
        className={`fixed inset-0 z-[110] flex items-end justify-center bg-black/70 ${sheet ? 'sm:p-4' : 'p-4'} sm:items-center`}
        style={overlayStyle}
      >
        <button
          type="button"
          aria-label="Fechar"
          tabIndex={-1}
          aria-hidden="true"
          disabled={loading}
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
              : 'max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-2xl p-5 max-w-md'
          } ${className}`}
          style={panelStyle}
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
              className={`${sheet ? 'min-h-0 flex-1 overflow-y-auto overscroll-contain ag-scroll px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-5' : 'mt-4'} ${bodyClassName}`}
            >
              {body}
            </div>
          )}
          {footer && (
            <div
              className={`flex gap-2 ${sheet ? 'shrink-0 border-t border-border px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-5' : 'mt-5'}`}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </FocusLock>,
    document.body
  );
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
  variant = 'dialog',
  ariaLabel,
  actions,
  children,
  body,
  bodyClassName = '',
  initialFocus = 'close-button',
  onExitComplete,
  footer,
}) => {
  const fullscreen = variant === 'fullscreen';
  const dialogKey = React.useRef(Symbol('dialog'));
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const fullscreenRef = React.useRef(fullscreen);

  const releaseDialog = React.useCallback(() => {
    const index = openDialogs.indexOf(dialogKey.current);
    if (index < 0) return;
    openDialogs.splice(index, 1);
    if (openDialogs.length === 0) document.body.style.overflow = previousBodyOverflow;
  }, []);

  useEffect(() => {
    fullscreenRef.current = fullscreen;
  }, [fullscreen]);

  useEffect(() => {
    if (!open) return;
    const key = dialogKey.current;
    if (openDialogs.length === 0) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    if (!openDialogs.includes(key)) openDialogs.push(key);
    return () => {
      // O fullscreen permanece travado durante a animação de saída; o
      // callback de exit libera a pilha e o scroll do documento.
      if (!fullscreenRef.current) releaseDialog();
    };
  }, [open, releaseDialog]);

  useEffect(() => () => releaseDialog(), [releaseDialog]);

  useEffect(() => {
    if (!fullscreen && !open) releaseDialog();
  }, [fullscreen, open, releaseDialog]);

  const handleExitComplete = React.useCallback(() => {
    releaseDialog();
    onExitComplete?.();
  }, [onExitComplete, releaseDialog]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented || openDialogs.at(-1) !== dialogKey.current)
        return;
      e.preventDefault();
      if (closeOnEscape && !loading) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeOnEscape, loading, onClose]);

  useEffect(() => {
    // O foco explícito é específico do fullscreen. Nos variants existentes,
    // o FocusLock mantém seu comportamento anterior (primeiro controle).
    if (!open || variant !== 'fullscreen' || initialFocus !== 'close-button') return;
    const rafId = requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => cancelAnimationFrame(rafId);
  }, [initialFocus, open, variant]);

  const sheet = variant === 'sheet';
  const visualViewport = useVisualViewport(open);
  if (!open && !fullscreen) return null;
  const headerProps = {
    variant,
    icon,
    iconClassName,
    titleId,
    title,
    actions,
    loading,
    onClose,
    closeButtonRef,
    children,
  };
  const overlayStyle = visualViewport
    ? fullscreen
      ? {
          top: `${visualViewport.top}px`,
          left: `${visualViewport.left}px`,
          width: `${visualViewport.width}px`,
          height: `${visualViewport.height}px`,
        }
      : { top: `${visualViewport.top}px`, height: `${visualViewport.height}px` }
    : undefined;
  const panelStyle = visualViewport
    ? { maxHeight: `${Math.max(160, visualViewport.height - (sheet ? 8 : 32))}px` }
    : undefined;

  if (fullscreen) {
    return (
      <FullscreenModalPortal
        open={open}
        title={title}
        titleId={titleId}
        role={role}
        ariaLabel={ariaLabel}
        className={className}
        loading={loading}
        onClose={onClose}
        actions={actions}
        children={children}
        body={body}
        bodyClassName={bodyClassName}
        footer={footer}
        closeButtonRef={closeButtonRef}
        overlayStyle={overlayStyle}
        onExitComplete={handleExitComplete}
      />
    );
  }

  return (
    <StandardModalPortal
      titleId={titleId}
      role={role}
      ariaLabel={ariaLabel}
      borderClassName={borderClassName}
      className={className}
      loading={loading}
      onClose={onClose}
      variant={variant === 'sheet' ? 'sheet' : 'dialog'}
      headerProps={headerProps}
      body={body}
      bodyClassName={bodyClassName}
      footer={footer}
      overlayStyle={overlayStyle}
      panelStyle={panelStyle}
    />
  );
};
