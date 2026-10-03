import React, { useEffect, useState } from 'react';
import {
  LuLoader,
  LuTriangleAlert,
  LuRefreshCcw,
  LuCircleCheck,
  LuCircleX,
  LuCircleAlert,
  LuActivity,
} from 'react-icons/lu';
import {
  adminInternalApi,
  OperationsHealth,
  OperationsStatus,
} from '../../infra/adminInternalApi';
import { NotificationHealthPanel } from '../../features/notifications';

const timeAgo = (iso: string, now: number): string => {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `há ${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `há ${minutes} min`;
  return `há ${Math.round(minutes / 60)}h`;
};

const STATUS_META: Record<
  OperationsStatus,
  { label: string; tone: string; icon: React.ReactNode; description: string }
> = {
  HEALTHY: {
    label: 'Saudável',
    tone: 'border-success/40 bg-success/10 text-success',
    icon: <LuCircleCheck size={18} />,
    description: 'Nenhum sinal de problema na plataforma nas últimas horas.',
  },
  DEGRADED: {
    label: 'Degradada',
    tone: 'border-warning/40 bg-warning/10 text-warning',
    icon: <LuCircleAlert size={18} />,
    description: 'Há falhas recentes sob investigação.',
  },
  UNHEALTHY: {
    label: 'Indisponível',
    tone: 'border-danger/40 bg-danger/10 text-danger',
    icon: <LuCircleX size={18} />,
    description: 'Falhas recorrentes exigem atenção imediata.',
  },
};

const OpsCard: React.FC<{ label: string; value: string; hint?: string; danger?: boolean }> = ({
  label,
  value,
  hint,
  danger,
}) => (
  <div className="bg-surface border border-border rounded-xl p-4">
    <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{label}</p>
    <p className={`text-2xl font-bold mt-2 ${danger ? 'text-danger' : 'text-text-primary'}`}>{value}</p>
    {hint && <p className="text-xs text-text-muted mt-1">{hint}</p>}
  </div>
);

const StatusBanner: React.FC<{ health: OperationsHealth }> = ({ health }) => {
  const meta = STATUS_META[health.status];
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${meta.tone}`}>
      <span className="mt-0.5">{meta.icon}</span>
      <div>
        <p className="text-sm font-bold">{meta.label}</p>
        <p className="text-xs opacity-80">{meta.description}</p>
      </div>
    </div>
  );
};

const Panel: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
    <h2 className="text-sm font-bold">{title}</h2>
    {children}
  </div>
);

const EmptyText: React.FC<{ text: string }> = ({ text }) => (
  <p className="text-sm text-text-muted">{text}</p>
);

const ErrorsPanel: React.FC<{ health: OperationsHealth }> = ({ health }) => (
  <div className="grid md:grid-cols-2 gap-4">
    <Panel title="Erros por status (24h)">
      {health.errors.byStatus.length === 0 ? (
        <EmptyText text="Nenhum erro registrado nas últimas 24 horas." />
      ) : (
        <ul className="space-y-2 text-sm">
          {health.errors.byStatus.map((row) => (
            <li key={row.statusCode} className="flex items-center justify-between gap-3">
              <span className={row.statusCode >= 500 ? 'text-danger font-medium' : 'text-text-secondary'}>
                HTTP {row.statusCode}
              </span>
              <span className="font-bold">{row.count}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>

    <Panel title="Caminhos com mais erros (24h)">
      {health.errors.topPaths.length === 0 ? (
        <EmptyText text="Nenhum caminho com erro nas últimas 24 horas." />
      ) : (
        <ul className="space-y-2 text-sm">
          {health.errors.topPaths.map((row) => (
            <li key={`${row.method} ${row.path}`} className="flex items-center justify-between gap-3">
              <span className="text-text-secondary truncate">
                <span className="font-medium text-text-primary">{row.method}</span> {row.path}
              </span>
              <span className="font-bold shrink-0">{row.count}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  </div>
);

const CronPanel: React.FC<{ health: OperationsHealth }> = ({ health }) => (
  <Panel title="Agendadores (cron)">
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="bg-bg border border-border rounded-lg p-3">
        <p className="text-xs text-text-muted">Falhas em 24h</p>
        <p className={`font-bold ${health.cron.failures24h > 0 ? 'text-danger' : 'text-success'}`}>
          {health.cron.failures24h}
        </p>
      </div>
      <div className="bg-bg border border-border rounded-lg p-3">
        <p className="text-xs text-text-muted">Em execução</p>
        <p className="font-bold">{health.cron.running}</p>
      </div>
    </div>
    {health.cron.recentFailures.length === 0 ? (
      <EmptyText text="Nenhuma falha recente de cron." />
    ) : (
      <ul className="space-y-2 text-sm">
        {health.cron.recentFailures.map((failure) => (
          <li key={failure.id} className="flex items-start justify-between gap-3">
            <span className="text-text-secondary truncate">
              <span className="font-medium text-text-primary">{failure.jobName}</span>
              {failure.error && <span className="block text-xs text-danger truncate">{failure.error}</span>}
            </span>
            <span className="text-xs text-text-muted shrink-0">
              {new Date(failure.startedAt).toLocaleString('pt-BR')}
            </span>
          </li>
        ))}
      </ul>
    )}
  </Panel>
);

const DeliveryPanel: React.FC<{ health: OperationsHealth }> = ({ health }) => (
  <Panel title="Entregas de mensagens (24h)">
    <div className="grid grid-cols-2 gap-3 text-sm">
      {(['whatsapp', 'email'] as const).map((channel) => {
        const stats = health.delivery[channel];
        const danger = stats.failedRatePct >= 50;
        return (
          <div key={channel} className="bg-bg border border-border rounded-lg p-3">
            <p className="text-xs text-text-muted uppercase">{channel}</p>
            <p className={`font-bold ${danger ? 'text-danger' : 'text-text-primary'}`}>
              {stats.failed24h} / {stats.total24h}
            </p>
            <p className="text-xs text-text-muted">
              falhas · taxa {stats.failedRatePct}%
            </p>
          </div>
        );
      })}
    </div>
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="bg-bg border border-border rounded-lg p-3">
        <p className="text-xs text-text-muted">Outbox pendente</p>
        <p className="font-bold">{health.outbox.pending}</p>
      </div>
      <div className="bg-bg border border-border rounded-lg p-3">
        <p className="text-xs text-text-muted">Outbox com falha</p>
        <p className={`font-bold ${health.outbox.failed > 0 ? 'text-danger' : ''}`}>
          {health.outbox.failed}
        </p>
      </div>
    </div>
  </Panel>
);

export const OperationsPage: React.FC = () => {
  const [health, setHealth] = useState<OperationsHealth | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let active = true;
    adminInternalApi
      .getOperationsHealth()
      .then((res) => {
        if (!active) return;
        setHealth(res.data);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError('Não foi possível carregar as informações de operação.');
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(id);
  }, []);

  if (!health && !error) {
    return (
      <div className="flex justify-center py-20">
        <LuLoader className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (error && !health) {
    return (
      <div className="text-center py-20">
        <LuTriangleAlert className="mx-auto mb-2 text-warning" size={24} />
        <p className="text-sm text-text-secondary">{error}</p>
        <button
          onClick={() => setReloadKey((key) => key + 1)}
          className="text-accent text-sm mt-2 hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!health) return null;

  const failedDeliveries =
    health.delivery.whatsapp.failed24h + health.delivery.email.failed24h;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <LuActivity size={20} /> Operação
          </h1>
          <p className="text-sm text-text-muted">Atualizado {timeAgo(health.generatedAt, now)}</p>
        </div>
        <button
          type="button"
          onClick={() => setReloadKey((key) => key + 1)}
          aria-label="Atualizar dados"
          className="p-2 rounded-lg border border-border bg-surface text-text-muted hover:bg-hover-bg"
        >
          <LuRefreshCcw size={16} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
          <LuTriangleAlert size={16} />
          {error}
        </div>
      )}

      <StatusBanner health={health} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <OpsCard
          label="Erros 5xx (24h)"
          value={String(health.errors.last24h5xx)}
          hint={`${health.errors.total24h} erros no total`}
          danger={health.errors.last24h5xx > 0}
        />
        <OpsCard
          label="Erros 5xx (1h)"
          value={String(health.errors.lastHour5xx)}
          hint="última hora"
          danger={health.errors.lastHour5xx > 0}
        />
        <OpsCard
          label="Falhas de cron (24h)"
          value={String(health.cron.failures24h)}
          hint={`${health.cron.running} em execução`}
          danger={health.cron.failures24h > 0}
        />
        <OpsCard
          label="Entregas com falha (24h)"
          value={String(failedDeliveries)}
          hint="WhatsApp + e-mail"
          danger={failedDeliveries > 0}
        />
      </div>

      <ErrorsPanel health={health} />

      <div className="grid md:grid-cols-2 gap-4">
        <CronPanel health={health} />
        <DeliveryPanel health={health} />
      </div>

      <div>
        <h2 className="text-sm font-bold mb-3">Saúde das notificações</h2>
        <NotificationHealthPanel />
      </div>
    </div>
  );
};

export default OperationsPage;
