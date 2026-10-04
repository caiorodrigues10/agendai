import React, { useEffect, useState } from 'react';
import { LuLoader, LuRefreshCcw, LuTriangleAlert } from 'react-icons/lu';
import { adminAuditApi, AuditAlerts } from '../../infra/adminAuditApi';
import { adminSessionsApi, AdminSession, SessionStatus } from '../../infra/adminSessionsApi';
import { ApiError } from '../../infra/apiClient';
import { AccountActionDialog } from './AccountActionDialog';

const time = (iso: string): string =>
  new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  });

interface PanelShellProps {
  title: string;
  hint: string;
  error: string | null;
  onRetry: () => void;
  children: React.ReactNode;
}

const PanelShell: React.FC<PanelShellProps> = ({ title, hint, error, onRetry, children }) => (
  <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
    <div>
      <h3 className="text-sm font-bold text-text-primary">{title}</h3>
      <p className="text-xs text-text-muted mt-0.5">{hint}</p>
    </div>
    {error ? (
      <div className="flex items-center gap-2 text-xs text-warning">
        <LuTriangleAlert size={14} />
        <span>{error}</span>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1 text-accent font-bold hover:underline"
        >
          <LuRefreshCcw size={12} /> Tentar novamente
        </button>
      </div>
    ) : (
      children
    )}
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
      .then((res) => {
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
      hint="Contas, impersonation, exclusões e bloqueios"
      error={error && !alerts ? error : null}
      onRetry={() => setReloadKey((key) => key + 1)}
    >
      {!alerts ? (
        <div className="flex justify-center py-6">
          <LuLoader className="animate-spin text-accent" size={20} />
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-2xl font-bold text-text-primary">
            {alerts.total}
            <span className="ml-2 text-xs font-medium text-text-muted">
              ação(ões) sensível(is)
            </span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {alerts.byGroup.map((group) => (
              <div key={group.key} className="bg-bg border border-border rounded-lg p-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                  {group.label}
                </p>
                <p
                  className={`text-lg font-bold mt-0.5 ${
                    group.count > 0 ? 'text-warning' : 'text-text-primary'
                  }`}
                >
                  {group.count}
                </p>
              </div>
            ))}
          </div>
          {alerts.recent.length > 0 && (
            <ul className="space-y-1.5 border-t border-border/50 pt-2">
              {alerts.recent.slice(0, 5).map((event) => (
                <li key={event.id} className="flex items-center gap-2 text-xs min-w-0">
                  <span className="font-mono text-accent truncate">{event.action}</span>
                  <span className="text-text-muted shrink-0">
                    {event.userName ?? event.userId.slice(0, 8)}
                  </span>
                  <span className="text-text-muted shrink-0 ml-auto">
                    {time(event.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </PanelShell>
  );
};

/** Sessões reais de acesso (`UserSession`) — listar e encerrar dispositivos. */
export const AuditSessionsPanel: React.FC = () => {
  const [sessions, setSessions] = useState<AdminSession[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [target, setTarget] = useState<AdminSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    adminSessionsApi
      .list({ limit: 8 })
      .then((res) => {
        if (!active) return;
        setSessions(res.data);
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
        setReloadKey((key) => key + 1);
      })
      .catch(() => setActionError('Não foi possível encerrar a sessão.'))
      .finally(() => setBusy(false));
  };

  const list = sessions ?? [];

  return (
    <PanelShell
      title="Sessões de acesso"
      hint="Dispositivos conectados agora (dados reais) — encerrar derruba o acesso na hora"
      error={error && !sessions ? error : null}
      onRetry={() => setReloadKey((key) => key + 1)}
    >
      {!sessions ? (
        <div className="flex justify-center py-6">
          <LuLoader className="animate-spin text-accent" size={20} />
        </div>
      ) : list.length === 0 ? (
        <p className="text-xs text-text-muted">Nenhuma sessão registrada.</p>
      ) : (
        <ul className="space-y-1.5" data-testid="audit-sessions-list">
          {list.map((session) => (
            <li key={session.id} className="flex items-center gap-2 text-xs min-w-0">
              <span className="font-medium text-text-primary truncate">{session.userName}</span>
              <span className="text-text-muted truncate hidden sm:inline">
                {session.deviceLabel ?? 'Dispositivo desconhecido'}
              </span>
              <span className="text-text-muted font-mono shrink-0">{session.ipAddress ?? '—'}</span>
              <span className="text-text-muted shrink-0">{time(session.lastSeenAt)}</span>
              <span className={`font-bold shrink-0 ${statusTone[session.status]}`}>
                {statusLabel[session.status]}
              </span>
              {session.current && (
                <span className="shrink-0 rounded bg-accent/15 px-1.5 py-0.5 font-bold text-accent">
                  Você
                </span>
              )}
              {session.status === 'active' && (
                <button
                  type="button"
                  onClick={() => {
                    setActionError(null);
                    setTarget(session);
                  }}
                  className="ml-auto shrink-0 rounded-lg border border-border px-2 py-1 font-bold text-danger hover:bg-danger/10"
                >
                  Encerrar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <AccountActionDialog
        open={target !== null}
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
          setTarget(null);
          setActionError(null);
        }}
      />
    </PanelShell>
  );
};
