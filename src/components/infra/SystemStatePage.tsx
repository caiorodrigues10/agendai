import React, { ReactNode } from 'react';
import { LifeBuoy } from 'lucide-react';
import { Logo } from '../ui/Logo';

export interface SystemStateAction {
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
}

interface SystemStatePageProps {
  code: string;
  title: string;
  description: string;
  icon: ReactNode;
  primaryAction: SystemStateAction;
  secondaryAction?: SystemStateAction;
  footer?: ReactNode;
}

const actionClassName = {
  primary:
    'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-accent-fg shadow-[0_12px_35px_rgba(16,185,129,0.18)] transition-all hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg sm:w-auto',
  secondary:
    'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-bold text-text-primary transition-colors hover:border-border-strong hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg sm:w-auto',
} as const;

function StateAction({
  action,
  variant,
}: {
  action: SystemStateAction;
  variant: keyof typeof actionClassName;
}) {
  const content = (
    <>
      {action.icon}
      <span>{action.label}</span>
    </>
  );

  if (action.href) {
    return (
      <a href={action.href} className={actionClassName[variant]}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={action.onClick} className={actionClassName[variant]}>
      {content}
    </button>
  );
}

/** Layout resiliente para páginas de estado que não dependem do restante da aplicação. */
export const SystemStatePage: React.FC<SystemStatePageProps> = ({
  code,
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  footer,
}) => (
  <div className="relative min-h-screen overflow-hidden bg-bg text-text-primary">
    <div
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(16,185,129,0.12),transparent_38%)]"
      aria-hidden="true"
    />
    <div
      className="pointer-events-none absolute -left-28 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-accent/5 blur-3xl"
      aria-hidden="true"
    />

    <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center px-5 py-5 sm:px-8">
      <a
        href="/"
        aria-label="Ir para a página inicial do AgendAI"
        className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        <Logo size="md" />
      </a>
    </header>

    <main className="relative z-10 mx-auto flex min-h-[calc(100vh-84px)] w-full max-w-6xl items-center justify-center px-5 pb-20 pt-8 sm:px-8">
      <section aria-labelledby="system-state-title" className="w-full max-w-xl text-center">
        <div className="relative mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl border border-accent/25 bg-accent/10 text-accent shadow-[0_0_50px_rgba(16,185,129,0.12)]">
          {icon}
        </div>

        <p className="mb-3 text-xs font-black uppercase tracking-[0.32em] text-accent">
          Erro {code}
        </p>
        <h1
          id="system-state-title"
          className="text-3xl font-black tracking-tight text-text-primary sm:text-5xl"
        >
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-text-secondary sm:text-base sm:leading-7">
          {description}
        </p>

        <div className="mt-8 flex flex-col-reverse items-stretch justify-center gap-3 sm:flex-row">
          {secondaryAction && <StateAction action={secondaryAction} variant="secondary" />}
          <StateAction action={primaryAction} variant="primary" />
        </div>

        {footer}

        <a
          href="/contato"
          className="mt-8 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-text-muted transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <LifeBuoy size={14} aria-hidden="true" />
          Precisa de ajuda? Fale com a gente
        </a>
      </section>
    </main>
  </div>
);

export default SystemStatePage;
