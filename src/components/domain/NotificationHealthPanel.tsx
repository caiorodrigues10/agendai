import React, { useCallback, useEffect, useState } from 'react';
import { Activity, AlertCircle, Clock3, RefreshCcw, Server, TimerReset } from 'lucide-react';
import { NotificationOperationsHealth, notificationsApi } from '../../infra/notificationsApi';
import { getErrorMessage } from '../../utils/errorMessage';

function formatDateTime(value?: string | null): string {
  if (!value) return 'Sem informação';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Sem informação' : date.toLocaleString('pt-BR');
}

function statusLabel(status?: string): string {
  if (!status) return 'Desconhecido';
  const normalized = status.toUpperCase();
  if (['HEALTHY', 'ONLINE', 'ACTIVE', 'OK'].includes(normalized)) return 'Saudável';
  if (['DEGRADED', 'WARNING', 'STALE'].includes(normalized)) return 'Atenção';
  if (['DOWN', 'OFFLINE', 'FAILED', 'UNHEALTHY'].includes(normalized)) return 'Indisponível';
  return status;
}

function statusClass(status?: string): string {
  const normalized = status?.toUpperCase() || '';
  if (['HEALTHY', 'ONLINE', 'ACTIVE', 'OK'].includes(normalized)) return 'text-success';
  if (['DEGRADED', 'WARNING', 'STALE'].includes(normalized)) return 'text-warning';
  if (['DOWN', 'OFFLINE', 'FAILED', 'UNHEALTHY'].includes(normalized)) return 'text-danger';
  return 'text-text-muted';
}

interface HealthCardProps {
  title: string;
  value: React.ReactNode;
  detail: string;
  icon: React.ReactNode;
  valueClassName?: string;
}

const HealthCard: React.FC<HealthCardProps> = ({ title, value, detail, icon, valueClassName = 'text-text-primary' }) => (
  <div className="min-w-0 rounded-xl border border-border bg-surface p-4">
    <div className="flex items-center gap-2 text-text-muted">
      {icon}
      <h3 className="text-xs font-bold uppercase tracking-wide">{title}</h3>
    </div>
    <p className={`mt-3 break-words text-xl font-bold ${valueClassName}`}>{value}</p>
    <p className="mt-1 break-words text-xs text-text-muted">{detail}</p>
  </div>
);

export const NotificationHealthPanel: React.FC = () => {
  const [health, setHealth] = useState<NotificationOperationsHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setHealth(await notificationsApi.getOperationsHealth());
    } catch (cause) {
      setError(getErrorMessage(cause, 'Não foi possível consultar a saúde das notificações.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div role="status" className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-text-muted">
        Consultando a operação de notificações...
      </div>
    );
  }

  if (error || !health) {
    return (
      <div role="alert" className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4 text-danger">
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="text-sm">{error || 'A API não retornou o estado da operação.'}</p>
          <button type="button" onClick={() => void load()} className="mt-2 inline-flex min-h-10 items-center gap-2 text-sm font-bold underline">
            <RefreshCcw size={15} /> Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const workerStatus = health.worker?.status || health.status;
  const schedulerStatus = health.scheduler?.status;
  const failureRate = health.deliveries?.failureRate;

  return (
    <section className="space-y-4" aria-labelledby="notification-health-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 id="notification-health-title" className="text-lg font-bold text-text-primary">Saúde das notificações</h3>
          <p className="mt-1 text-sm text-text-secondary">Visão operacional do worker, scheduler, outbox e filas.</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-bold text-text-secondary hover:bg-surface-2 hover:text-text-primary"
        >
          <RefreshCcw size={16} /> Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <HealthCard
          title="Worker"
          value={statusLabel(workerStatus)}
          detail={`Último sinal: ${formatDateTime(health.worker?.lastHeartbeatAt || health.worker?.heartbeatAt)}`}
          icon={<Server size={16} />}
          valueClassName={statusClass(workerStatus)}
        />
        <HealthCard
          title="Scheduler"
          value={statusLabel(schedulerStatus)}
          detail={`Último sinal: ${formatDateTime(health.scheduler?.lastHeartbeatAt || health.scheduler?.heartbeatAt)}`}
          icon={<Clock3 size={16} />}
          valueClassName={statusClass(schedulerStatus)}
        />
        <HealthCard
          title="Outbox pendente"
          value={health.outbox?.pending ?? 0}
          detail={`Mais antigo: ${formatDateTime(health.outbox?.oldestPendingAt)}`}
          icon={<TimerReset size={16} />}
        />
        <HealthCard
          title="Fila ativa"
          value={(health.queue?.waiting ?? 0) + (health.queue?.active ?? 0)}
          detail={`${health.queue?.waiting ?? 0} aguardando · ${health.queue?.active ?? 0} processando`}
          icon={<Activity size={16} />}
        />
        <HealthCard
          title="Falhas na fila"
          value={health.queue?.failed ?? 0}
          detail={`${health.queue?.delayed ?? 0} envio(s) aguardando nova tentativa`}
          icon={<AlertCircle size={16} />}
          valueClassName={(health.queue?.failed ?? 0) > 0 ? 'text-danger' : 'text-success'}
        />
        <HealthCard
          title="Falha em 15 min"
          value={failureRate === undefined ? 'Sem dados' : `${failureRate.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`}
          detail={`${health.deliveries?.failedLast15Minutes ?? 0} de ${health.deliveries?.totalLast15Minutes ?? 0} entrega(s)`}
          icon={<Activity size={16} />}
          valueClassName={(failureRate ?? 0) > 5 ? 'text-danger' : 'text-success'}
        />
      </div>

      {health.checkedAt && (
        <p className="text-right text-xs text-text-muted">Atualizado em {formatDateTime(health.checkedAt)}</p>
      )}
    </section>
  );
};
