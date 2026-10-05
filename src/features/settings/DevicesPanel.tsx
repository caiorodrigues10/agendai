import React, { useEffect, useState } from 'react';
import { LuLoader, LuRefreshCcw, LuTriangleAlert } from 'react-icons/lu';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { authApi, MySession, SessionStatus } from '../../infra/authApi';
import { authStorage } from '../../infra/authStorage';

const time = (iso: string): string =>
  new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  });

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

/** "Meus dispositivos" — sessões reais da conta logada (`/api/auth/sessions`). */
export const DevicesPanel: React.FC = () => {
  const [sessions, setSessions] = useState<MySession[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [target, setTarget] = useState<MySession | null>(null);
  const [confirmOthers, setConfirmOthers] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    authApi
      .mySessions(authStorage.getAccessToken() || '')
      .then((res) => {
        if (!active) return;
        setSessions(res.data);
        setError(null);
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar os dispositivos.');
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const revoke = () => {
    if (!target) return;
    setBusy(true);
    authApi
      .revokeMySession(target.id, { confirmSelf: target.current }, authStorage.getAccessToken() || '')
      .then(() => {
        setActionError(null);
        setTarget(null);
        setReloadKey((key) => key + 1);
      })
      .catch(() => setActionError('Não foi possível encerrar a sessão.'))
      .finally(() => setBusy(false));
  };

  const revokeOthers = () => {
    setBusy(true);
    authApi
      .revokeOtherSessions({}, authStorage.getAccessToken() || '')
      .then(() => {
        setActionError(null);
        setConfirmOthers(false);
        setReloadKey((key) => key + 1);
      })
      .catch(() => setActionError('Não foi possível encerrar os outros dispositivos.'))
      .finally(() => setBusy(false));
  };

  const list = sessions ?? [];
  const otherActive = list.filter((s) => s.status === 'active' && !s.current).length;

  return (
    <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-text-primary">Meus dispositivos</h3>
          <p className="mt-0.5 text-xs text-text-muted">
            Sessões conectadas à sua conta — encerrar derruba o acesso na hora.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReloadKey((key) => key + 1)}
          className="shrink-0 text-accent hover:underline"
          aria-label="Atualizar dispositivos"
        >
          <LuRefreshCcw size={14} />
        </button>
      </div>

      {error && !sessions ? (
        <div className="flex items-center gap-2 text-xs text-warning">
          <LuTriangleAlert size={14} />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="inline-flex items-center gap-1 font-bold text-accent hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      ) : !sessions ? (
        <div className="flex justify-center py-4">
          <LuLoader className="animate-spin text-accent" size={18} />
        </div>
      ) : list.length === 0 ? (
        <p className="text-xs text-text-muted">Nenhuma sessão registrada.</p>
      ) : (
        <ul className="space-y-1.5" data-testid="my-sessions-list">
          {list.map((session) => (
            <li key={session.id} className="flex items-center gap-2 text-xs min-w-0">
              <span className="font-medium text-text-primary truncate">
                {session.deviceLabel ?? 'Dispositivo desconhecido'}
              </span>
              <span className="font-mono text-text-muted shrink-0">{session.ipAddress ?? '—'}</span>
              <span className="text-text-muted shrink-0">{time(session.lastSeenAt)}</span>
              <span className={`font-bold shrink-0 ${statusTone[session.status]}`}>
                {statusLabel[session.status]}
              </span>
              {session.current && (
                <span className="shrink-0 rounded bg-accent/15 px-1.5 py-0.5 font-bold text-accent">
                  Este dispositivo
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

      {otherActive > 0 && (
        <button
          type="button"
          onClick={() => {
            setActionError(null);
            setConfirmOthers(true);
          }}
          className="w-full rounded-lg border border-border px-3 py-2 text-xs font-bold text-danger hover:bg-danger/10"
        >
          Encerrar todos os outros dispositivos ({otherActive})
        </button>
      )}

      <ConfirmDialog
        open={target !== null}
        title="Encerrar sessão"
        message={
          target
            ? `Encerrar a sessão em ${target.deviceLabel ?? 'dispositivo desconhecido'}? ${
                target.current
                  ? 'Esta é a sessão atual: você ficará desconectado deste navegador.'
                  : 'O acesso deste dispositivo será bloqueado na hora.'
              }`
            : ''
        }
        confirmLabel="Encerrar"
        variant="danger"
        loading={busy}
        onConfirm={revoke}
        onCancel={() => {
          setTarget(null);
          setActionError(null);
        }}
      />
      <ConfirmDialog
        open={confirmOthers}
        title="Encerrar outros dispositivos"
        message={`Encerrar as ${otherActive} outras sessões ativas? Os acessos serão bloqueados na hora; este navegador continua conectado.`}
        confirmLabel="Encerrar todos"
        variant="danger"
        loading={busy}
        onConfirm={revokeOthers}
        onCancel={() => {
          setConfirmOthers(false);
          setActionError(null);
        }}
      />
      {actionError && <p className="text-xs text-danger">{actionError}</p>}
    </section>
  );
};
