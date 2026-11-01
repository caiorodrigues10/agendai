import React, { useEffect, useState } from 'react';
import { LuBan } from 'react-icons/lu';
import {
  adminWhatsappApi,
  type FailedWhatsAppDelivery,
  type FailedWhatsAppOutbox,
} from '../../infra/adminWhatsappApi';
import { WhatsAppTabs } from './WhatsAppTabs';
import { SectionError, Tooltip } from '../../components/patterns';
import { AccountActionDialog } from './AccountActionDialog';
import { useAuth } from '../../contexts/AuthContext';
import { INTERNAL_PERMISSIONS, hasInternalPermission } from '../../utils/internalPermissions';

interface RetryTarget {
  kind: 'delivery' | 'outbox';
  id: string;
  label: string;
}

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : 'Não foi possível reenviar.';
}

function RetryButton({
  label,
  disabled,
  reason,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  reason?: string;
  onClick: () => void;
}) {
  const button = (
    <button
      type="button"
      disabled={disabled}
      className="rounded bg-accent px-2 py-1 text-xs text-accent-fg hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
      onClick={onClick}
    >
      {label}
    </button>
  );

  if (!disabled || !reason) return button;

  return (
    <Tooltip label={reason}>
      <span className="inline-flex">{button}</span>
    </Tooltip>
  );
}

function NotRetryableBadge({ reason }: { reason?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-border px-2 py-0.5 text-xs text-text-muted">
      <LuBan size={12} aria-hidden="true" />
      Não reenviável
      {reason ? <span className="sr-only"> — {reason}</span> : null}
    </span>
  );
}

export const WhatsAppFailuresPage: React.FC = () => {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<FailedWhatsAppDelivery[]>([]);
  const [outbox, setOutbox] = useState<FailedWhatsAppOutbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<RetryTarget | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const canManage = hasInternalPermission(user?.internalPermissions, INTERNAL_PERMISSIONS.WHATSAPP_MANAGE);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminWhatsappApi.failedNotifications();
      setDeliveries(res.data.deliveries);
      setOutbox(res.data.outbox);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const runRetry = async (reason: string) => {
    if (!target) return;
    setActionLoading(true);
    setActionError(null);
    try {
      if (target.kind === 'delivery') {
        await adminWhatsappApi.retryDelivery(target.id, reason);
      } else {
        await adminWhatsappApi.retryOutbox(target.id, reason);
      }
      setTarget(null);
      await load();
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && deliveries.length === 0 && outbox.length === 0) {
    return <div className="p-6 text-text-muted">Carregando…</div>;
  }
  if (error) return <SectionError message={error} onRetry={load} />;

  return (
    <div className="p-6 space-y-4">
      <WhatsAppTabs />
      <h1 className="text-xl font-bold">WhatsApp — Falhas de envio</h1>

      {actionError && !target && (
        <p role="alert" className="text-sm text-danger">{actionError}</p>
      )}

      <h2 className="font-bold">Entregas</h2>
      {deliveries.length === 0 ? (
        <p className="text-sm text-text-muted">Nenhuma entrega com falha.</p>
      ) : (
        <ul className="space-y-2">
          {deliveries.map((delivery) => (
            <li key={delivery.id} className="flex flex-wrap items-center gap-2 rounded border border-border p-2 text-sm">
              <span className="flex-1">
                {delivery.type} — {delivery.status} — {delivery.errorMessage ?? 'sem erro'}
              </span>
              {!delivery.retryable && <NotRetryableBadge reason={delivery.notRetryableReason} />}
              {canManage && (
                <RetryButton
                  label="Reenviar"
                  disabled={!delivery.retryable}
                  reason={delivery.notRetryableReason}
                  onClick={() => {
                    setActionError(null);
                    setTarget({ kind: 'delivery', id: delivery.id, label: delivery.type });
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      <h2 className="font-bold">Outbox</h2>
      {outbox.length === 0 ? (
        <p className="text-sm text-text-muted">Nenhum item no outbox com falha.</p>
      ) : (
        <ul className="space-y-2">
          {outbox.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center gap-2 rounded border border-border p-2 text-sm">
              <span className="flex-1">
                {row.status} — {row.lastError ?? 'sem erro'}
              </span>
              {!row.retryable && <NotRetryableBadge reason={row.notRetryableReason} />}
              {canManage && (
                <RetryButton
                  label="Reenviar"
                  disabled={!row.retryable}
                  reason={row.notRetryableReason}
                  onClick={() => {
                    setActionError(null);
                    setTarget({ kind: 'outbox', id: row.id, label: 'outbox' });
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      <AccountActionDialog
        open={!!target}
        title="Reenviar notificação"
        message={target ? `Reenviar ${target.label}. O motivo fica registrado na auditoria.` : ''}
        confirmLabel="Reenviar"
        loading={actionLoading}
        error={actionError}
        onConfirm={runRetry}
        onCancel={() => { if (!actionLoading) { setTarget(null); setActionError(null); } }}
      />
    </div>
  );
};
export default WhatsAppFailuresPage;
