import React, { useEffect, useState } from 'react';
import { LuLoader } from 'react-icons/lu';
import {
  adminWhatsappApi,
  type WhatsAppFailedJob,
  type WhatsAppQueueCounts,
  type WhatsAppQueuesData,
} from '../../infra/adminWhatsappApi';
import { WhatsAppTabs } from './WhatsAppTabs';
import { SectionError } from '../../components/patterns';
import { AccountActionDialog } from './AccountActionDialog';
import { useAuth } from '../../contexts/AuthContext';
import { INTERNAL_PERMISSIONS, hasInternalPermission } from '../../utils/internalPermissions';

type QueueAction = 'reprocess' | 'clean';

const QUEUE_LABEL: Record<string, string> = {
  whatsapp: 'Envio de WhatsApp',
  'whatsapp-ai': 'Atendente de IA',
  'owner-bot': 'Assistente do dono',
};

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : 'Não foi possível concluir a ação.';
}

function CountsTable({ name, counts }: { name: string; counts: WhatsAppQueueCounts | undefined }) {
  if (!counts) return null;
  if (!counts.available) {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm" role="alert">
        <p className="font-medium">{QUEUE_LABEL[name] ?? name} — fila indisponível</p>
        <p className="text-xs text-text-muted">{counts.error ?? 'Não foi possível ler a fila.'}</p>
      </div>
    );
  }
  return (
    <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
      <div><dt className="text-text-muted">Aguardando</dt><dd>{counts.wait ?? 0}</dd></div>
      <div><dt className="text-text-muted">Ativas</dt><dd>{counts.active ?? 0}</dd></div>
      <div><dt className="text-text-muted">Concluídas</dt><dd>{counts.completed ?? 0}</dd></div>
      <div><dt className="text-text-muted">Falhadas</dt><dd>{counts.failed ?? 0}</dd></div>
      <div><dt className="text-text-muted">Atrasadas</dt><dd>{counts.delayed ?? 0}</dd></div>
    </dl>
  );
}

export const WhatsAppQueuesPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<WhatsAppQueuesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [action, setAction] = useState<{ queue: string; job: WhatsAppFailedJob; kind: QueueAction } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const canManage = hasInternalPermission(user?.internalPermissions, INTERNAL_PERMISSIONS.WHATSAPP_MANAGE);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminWhatsappApi.queues();
      setData(res.data);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    void (async () => {
      await Promise.resolve();
      if (!active) return;
      await load();
    })();
    return () => { active = false; };
  }, []);

  const runAction = async (reason: string) => {
    if (!action) return;
    setActionLoading(true);
    setActionError(null);
    try {
      if (action.kind === 'reprocess') {
        await adminWhatsappApi.reprocessJob(action.queue, action.job.id ?? '', reason);
      } else {
        await adminWhatsappApi.cleanJob(action.queue, action.job.id ?? '', reason);
      }
      setAction(null);
      await load();
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !data) {
    return <div className="p-6 text-text-muted"><LuLoader className="animate-spin" /></div>;
  }
  if (error) return <SectionError message={error} onRetry={load} />;

  const queues = Object.keys(data?.counts ?? {});

  return (
    <div className="p-6 space-y-4">
      <WhatsAppTabs />
      <h1 className="text-xl font-bold">WhatsApp — Filas</h1>

      {actionError && !action && (
        <p role="alert" className="text-sm text-danger">{actionError}</p>
      )}

      {queues.map((name) => {
        const queueJobs = data?.failed?.[name];
        const jobs = queueJobs?.available ? queueJobs.jobs ?? [] : [];
        return (
          <section key={name} className="rounded-xl border border-border p-4 space-y-3">
            <h2 className="font-bold">{QUEUE_LABEL[name] ?? name}</h2>
            <CountsTable name={name} counts={data?.counts?.[name]} />

            {!queueJobs?.available && (
              <p role="alert" className="text-sm text-danger">
                Fila indisponível — {queueJobs?.error ?? 'Não foi possível ler os jobs.'}
              </p>
            )}

            {queueJobs?.available && jobs.length === 0 && (
              <p className="text-xs text-text-muted">Nenhum job com falha.</p>
            )}

            <ul className="space-y-2">
              {jobs.map((job) => (
                <li key={`${name}-${job.id}`} className="rounded border border-border p-2 text-xs">
                  <p className="font-medium">{job.name}</p>
                  <p className="text-text-muted">{job.failedReason || 'sem motivo registrado'}</p>
                  <p className="text-text-muted">Tentativas: {job.attemptsMade} · Telefone: {job.phoneMasked ?? '—'}</p>
                  {canManage && (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        className="rounded bg-accent px-2 py-1 text-accent-fg"
                        onClick={() => { setActionError(null); setAction({ queue: name, job, kind: 'reprocess' }); }}
                      >
                        Reprocessar
                      </button>
                      <button
                        type="button"
                        className="rounded bg-danger px-2 py-1 text-danger-fg"
                        onClick={() => { setActionError(null); setAction({ queue: name, job, kind: 'clean' }); }}
                      >
                        Limpar
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <AccountActionDialog
        open={!!action}
        title={action?.kind === 'clean' ? 'Limpar job' : 'Reprocessar job'}
        message={
          action
            ? `${action.kind === 'clean' ? 'Remover' : 'Reprocessar'} o job ${action.job.name ?? ''} da fila ${QUEUE_LABEL[action.queue] ?? action.queue}. O motivo fica registrado na auditoria.`
            : ''
        }
        confirmLabel={action?.kind === 'clean' ? 'Limpar' : 'Reprocessar'}
        danger={action?.kind === 'clean'}
        loading={actionLoading}
        error={actionError}
        onConfirm={runAction}
        onCancel={() => { if (!actionLoading) { setAction(null); setActionError(null); } }}
      />
    </div>
  );
};
export default WhatsAppQueuesPage;
