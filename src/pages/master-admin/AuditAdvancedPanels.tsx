import React, { useEffect, useId, useState } from 'react';
import {
  LuChevronDown,
  LuClock3,
  LuLoader,
  LuMonitor,
  LuRefreshCcw,
  LuShieldCheck,
  LuTriangleAlert,
} from 'react-icons/lu';
import { adminAuditApi, AuditAlerts } from '../../infra/adminAuditApi';
import { adminSessionsApi, AdminSession, SessionStatus } from '../../infra/adminSessionsApi';
import { ApiError } from '../../infra/apiClient';
import { Button } from '../../components/ui/Button';
import { AccountActionDialog } from './AccountActionDialog';
import { auditActorLabel, describeAuditAction } from './auditPresentation';

const time = (iso: string): string =>
  new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  });

interface PanelShellProps {
  title: string;
  hint: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  error: string | null;
  onRetry: () => void;
  children: React.ReactNode;
}

const PanelShell: React.FC<PanelShellProps> = ({
  title,
  hint,
  icon,
  badge,
  error,
  onRetry,
  children,
}) => {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className="min-w-0 self-start space-y-4 rounded-2xl border border-border bg-surface p-4 sm:p-5"
    >
      <header className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id={titleId} className="text-sm font-bold text-text-primary">
              {title}
            </h2>
            {badge}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-text-secondary">{hint}</p>
        </div>
      </header>
      {error ? (
        <div
          role="alert"
          className="space-y-3 rounded-xl border border-warning/30 bg-warning/5 p-3"
        >
          <p className="flex items-start gap-2 text-sm text-text-secondary">
            <LuTriangleAlert
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-warning"
              size={16}
            />
            {error}
          </p>
          <Button variant="secondary" size="sm" onClick={onRetry} className="min-h-11">
            <LuRefreshCcw aria-hidden="true" size={14} /> Tentar novamente
          </Button>
        </div>
      ) : (
        children
      )}
    </section>
  );
};

const PanelLoading: React.FC<{ label: string }> = ({ label }) => (
  <div role="status" className="flex items-center gap-2 py-4 text-sm text-text-secondary">
    <LuLoader
      aria-hidden="true"
      className="animate-spin text-accent motion-reduce:animate-none"
      size={18}
    />
    {label}
  </div>
);

const statusTone: Record<SessionStatus, string> = {
  active: 'text-success',
  expired: 'text-warning',
  revoked: 'text-text-muted',
};

const statusLabel: Record<SessionStatus, string> = {
  active: 'Ativa',
  expired: 'Expirada',
  revoked: 'Encerrada',
};

/** Alertas de ações sensíveis das últimas 24h (agrupados + recentes). */
export const AuditAlertsPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<AuditAlerts | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    adminAuditApi
      .getAuditAlerts()
      .then(res => {
        if (!active) return;
        setAlerts(res.data);
        setError(null);
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar os alertas.');
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  return (
    <PanelShell
      title="Alertas sensíveis (24h)"
      hint="Acompanhe alterações de conta, acessos assistidos, exclusões e bloqueios."
      icon={<LuShieldCheck aria-hidden="true" size={20} />}
      badge={
        <span className="rounded-full border border-border bg-bg px-2 py-0.5 text-xs font-medium text-text-secondary">
          Últimas 24h
        </span>
      }
      error={error && !alerts ? error : null}
      onRetry={() => setReloadKey(key => key + 1)}
    >
      {!alerts ? (
        <PanelLoading label="Carregando alertas…" />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <p
              className={`text-3xl font-bold tabular-nums ${alerts.total > 0 ? 'text-warning' : 'text-text-primary'}`}
            >
              {alerts.total}
            </p>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {alerts.total === 1 ? 'ação sensível' : 'ações sensíveis'}
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">
                {alerts.total === 0
                  ? 'Nenhuma ação sensível nas últimas 24 horas.'
                  : alerts.total === 1
                    ? 'Registrada nas últimas 24 horas.'
                    : 'Registradas nas últimas 24 horas.'}
              </p>
            </div>
          </div>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Ações sensíveis por categoria"
          >
            {alerts.byGroup.map(group => (
              <div
                key={group.key}
                className="inline-flex max-w-full items-center gap-2 rounded-lg border border-border bg-bg px-2.5 py-1.5"
              >
                <span className="min-w-0 text-xs leading-relaxed text-text-secondary">
                  {group.label}
                </span>
                <span
                  className={`shrink-0 text-sm font-bold tabular-nums ${
                    group.count > 0 ? 'text-warning' : 'text-text-primary'
                  }`}
                >
                  {group.count}
                </span>
              </div>
            ))}
          </div>
          {alerts.recent.length > 0 && (
            <details className="group border-t border-border pt-1">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-lg text-sm font-semibold text-text-secondary outline-none hover:text-text-primary focus-visible:ring-2 focus-visible:ring-focus [&::-webkit-details-marker]:hidden">
                Ver ações sensíveis recentes
                <LuChevronDown
                  aria-hidden="true"
                  size={16}
                  className="shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                />
              </summary>
              <ul className="divide-y divide-border/60">
                {alerts.recent.slice(0, 5).map(event => (
                  <li key={event.id} className="min-w-0 space-y-1 py-2.5">
                    <p className="break-words text-sm font-medium text-text-primary">
                      {describeAuditAction(event.action, event.resource).label}
                    </p>
                    <p className="break-words font-mono text-xs text-text-secondary">
                      {event.action}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
                      <span className="break-words">
                        {event.userName ?? auditActorLabel(event.userId)}
                      </span>
                      <time dateTime={event.createdAt}>{time(event.createdAt)}</time>
                    </div>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </PanelShell>
  );
};

/** Sessões reais de acesso (`UserSession`) — listar e encerrar dispositivos. */
export const AuditSessionsPanel: React.FC = () => {
  const [sessions, setSessions] = useState<AdminSession[] | null>(null);
  const [totalSessions, setTotalSessions] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [target, setTarget] = useState<AdminSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    adminSessionsApi
      .list({ limit: 8 })
      .then(res => {
        if (!active) return;
        setSessions(res.data);
        setTotalSessions(res.meta.total);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        const status = err instanceof ApiError ? err.statusCode : 0;
        setError(
          status === 403
            ? 'Sem permissão para ver sessões (requer Gerenciar usuários).'
            : 'Não foi possível carregar as sessões.'
        );
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const revoke = (reason: string) => {
    if (!target) return;
    setBusy(true);
    adminSessionsApi
      .revoke(target.id, { reason, confirmSelf: target.current })
      .then(() => {
        setActionError(null);
        setTarget(null);
        setReloadKey(key => key + 1);
      })
      .catch(() => setActionError('Não foi possível encerrar a sessão.'))
      .finally(() => setBusy(false));
  };

  const list = sessions ?? [];

  return (
    <PanelShell
      title="Sessões de acesso"
      hint="Acessos recentes por dispositivo, incluindo sessões encerradas."
      icon={<LuMonitor aria-hidden="true" size={20} />}
      badge={
        sessions && sessions.length > 0 ? (
          <span className="rounded-full border border-border bg-bg px-2 py-0.5 text-xs font-medium tabular-nums text-text-secondary">
            {sessions.length} {sessions.length === 1 ? 'exibida' : 'exibidas'}
            {totalSessions !== null && totalSessions > sessions.length
              ? ` de ${totalSessions}`
              : ''}
          </span>
        ) : undefined
      }
      error={error && !sessions ? error : null}
      onRetry={() => setReloadKey(key => key + 1)}
    >
      {!sessions ? (
        <PanelLoading label="Carregando sessões…" />
      ) : list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-3 py-4 text-sm text-text-secondary">
          Nenhuma sessão registrada.
        </p>
      ) : (
        <ul
          aria-label="Sessões recentes"
          className="max-h-64 space-y-2 overflow-y-auto rounded-xl pr-1 outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          data-testid="audit-sessions-list"
        >
          {list.map(session => (
            <li
              key={session.id}
              className="flex min-w-0 flex-wrap items-center gap-3 rounded-xl border border-border bg-bg/40 p-3"
            >
              <div className="min-w-0 flex-1 basis-40 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="break-words text-sm font-semibold text-text-primary">
                    {session.userName}
                  </span>
                  <span
                    className={`rounded-md bg-surface px-1.5 py-0.5 text-xs font-semibold ${statusTone[session.status]}`}
                  >
                    {statusLabel[session.status]}
                  </span>
                  {session.current && (
                    <span className="rounded-md bg-accent/10 px-1.5 py-0.5 text-xs font-semibold text-accent">
                      Você
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-relaxed text-text-secondary">
                  <span className="break-words">
                    {session.deviceLabel ?? 'Dispositivo desconhecido'}
                  </span>
                  <span className="break-all font-mono">
                    <span className="sr-only">IP: </span>
                    {session.ipAddress ?? 'IP indisponível'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <LuClock3 aria-hidden="true" size={12} className="shrink-0" />
                    <time dateTime={session.lastSeenAt} title="Última atividade">
                      <span className="sr-only">Última atividade: </span>
                      {time(session.lastSeenAt)}
                    </time>
                  </span>
                </div>
              </div>
              {session.status === 'active' && (
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={busy}
                  aria-label={`Encerrar sessão de ${session.userName} em ${session.deviceLabel ?? 'dispositivo desconhecido'}`}
                  onClick={() => {
                    setActionError(null);
                    setTarget(session);
                  }}
                  className="min-h-11 shrink-0 text-danger hover:border-danger/40 hover:bg-danger/10"
                >
                  Encerrar
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {target && (
        <AccountActionDialog
          key={target.id}
          open
          title="Encerrar sessão"
          message={
            target
              ? `Encerrar a sessão de ${target.userName} em ${
                  target.deviceLabel ?? 'dispositivo desconhecido'
                }? ${
                  target.current
                    ? 'Esta é a sessão atual: você ficará desconectado deste navegador.'
                    : ''
                }`
              : ''
          }
          confirmLabel="Encerrar sessão"
          danger
          loading={busy}
          error={actionError}
          onConfirm={revoke}
          onCancel={() => {
            if (busy) return;
            setTarget(null);
            setActionError(null);
          }}
        />
      )}
    </PanelShell>
  );
};
