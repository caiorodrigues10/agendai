import React, { useEffect, useState } from 'react';
import { LuLoader, LuRefreshCcw, LuTriangleAlert } from 'react-icons/lu';
import { adminAuditApi, AuditAlerts, AuditSessions } from '../../infra/adminAuditApi';

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

const statusTone: Record<AuditSessions['sessions'][number]['status'], string> = {
  ACTIVE: 'text-success',
  EXPIRED: 'text-warning',
  CLOSED: 'text-text-muted',
};

const statusLabel: Record<AuditSessions['sessions'][number]['status'], string> = {
  ACTIVE: 'Ativa',
  EXPIRED: 'Expirada',
  CLOSED: 'Encerrada',
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

/** Sessões de acesso (login/refresh/logout) das últimas 24h. */
export const AuditSessionsPanel: React.FC = () => {
  const [sessions, setSessions] = useState<AuditSessions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    adminAuditApi
      .getAuditSessions()
      .then((res) => {
        if (!active) return;
        setSessions(res.data);
        setError(null);
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar as sessões.');
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const list = sessions?.sessions ?? [];

  return (
    <PanelShell
      title="Sessões (24h)"
      hint="Último evento por usuário + IP; ativa = movimento há <30min"
      error={error && !sessions ? error : null}
      onRetry={() => setReloadKey((key) => key + 1)}
    >
      {!sessions ? (
        <div className="flex justify-center py-6">
          <LuLoader className="animate-spin text-accent" size={20} />
        </div>
      ) : list.length === 0 ? (
        <p className="text-xs text-text-muted">Nenhuma sessão nas últimas 24h.</p>
      ) : (
        <ul className="space-y-1.5">
          {list.slice(0, 8).map((session) => (
            <li key={session.key} className="flex items-center gap-2 text-xs min-w-0">
              <span className="font-medium text-text-primary truncate">
                {session.name ?? session.email ?? '—'}
              </span>
              <span className="text-text-muted font-mono shrink-0">{session.ip ?? '—'}</span>
              <span className="text-text-muted shrink-0">{session.lastEvent}</span>
              <span className={`font-bold shrink-0 ml-auto ${statusTone[session.status]}`}>
                {statusLabel[session.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </PanelShell>
  );
};
