import React, { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageCircle,
  RefreshCcw,
  RotateCcw,
} from 'lucide-react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import {
  ListNotificationDeliveriesParams,
  NotificationChannel,
  NotificationDelivery,
  NotificationDeliveryStatus,
  NotificationListMeta,
  notificationsApi,
} from '../../infra/notificationsApi';
import { getErrorMessage } from '../../utils/errorMessage';

const PAGE_SIZE = 10;

const STATUS_LABELS: Record<NotificationDeliveryStatus, string> = {
  PENDING: 'Pendente',
  QUEUED: 'Na fila',
  PROCESSING: 'Processando',
  RETRYING: 'Nova tentativa',
  SENT: 'Aceita pelo provedor',
  DELIVERED: 'Entregue',
  READ: 'Lida',
  FAILED: 'Falhou',
  BOUNCED: 'E-mail devolvido',
  COMPLAINED: 'Marcada como spam',
  SUPPRESSED: 'Suprimida',
  SKIPPED: 'Ignorada',
  CANCELED: 'Cancelada',
};

const STATUS_STYLES: Record<NotificationDeliveryStatus, string> = {
  PENDING: 'border-warning/30 bg-warning/10 text-warning',
  QUEUED: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  PROCESSING: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  RETRYING: 'border-warning/30 bg-warning/10 text-warning',
  SENT: 'border-accent/30 bg-accent/10 text-accent',
  DELIVERED: 'border-success/30 bg-success/10 text-success',
  READ: 'border-success/30 bg-success/10 text-success',
  FAILED: 'border-danger/30 bg-danger/10 text-danger',
  BOUNCED: 'border-danger/30 bg-danger/10 text-danger',
  COMPLAINED: 'border-danger/30 bg-danger/10 text-danger',
  SUPPRESSED: 'border-danger/30 bg-danger/10 text-danger',
  SKIPPED: 'border-border bg-surface-2 text-text-muted',
  CANCELED: 'border-border bg-surface-2 text-text-muted',
};

const TYPE_LABELS: Record<string, string> = {
  APPOINTMENT_CONFIRMATION: 'Confirmação de agendamento',
  APPOINTMENT_REMINDER: 'Lembrete de agendamento',
  APPOINTMENT_CANCELLATION: 'Cancelamento de agendamento',
  QUEUE_JOINED: 'Entrada na fila',
  QUEUE_NEAR_TURN: 'Cliente próximo da vez',
  QUEUE_CALLED: 'Chamada do cliente',
  QUEUE_CANCELED: 'Cancelamento da fila',
  CAMPAIGN: 'Campanha CRM',
  EMAIL_VERIFICATION: 'Verificação de e-mail',
  WELCOME: 'Boas-vindas',
  MANUAL: 'Envio manual',
};

const ERROR_LABELS: Record<string, string> = {
  INVALID_DESTINATION: 'O destinatário é inválido ou está incompleto.',
  PROVIDER_UNAVAILABLE: 'O provedor estava indisponível após as tentativas automáticas.',
  EVOLUTION_NOT_CONFIGURED: 'Conecte o WhatsApp do salão para realizar este envio.',
  SUPPRESSED: 'O destinatário não pode receber novas mensagens.',
  RATE_LIMITED: 'O provedor limitou temporariamente os envios.',
};

interface Filters {
  channel: '' | NotificationChannel;
  type: string;
  status: '' | NotificationDeliveryStatus;
  from: string;
  to: string;
  barbershopId: string;
}

const EMPTY_FILTERS: Filters = {
  channel: '',
  type: '',
  status: '',
  from: '',
  to: '',
  barbershopId: '',
};

const EMPTY_META: NotificationListMeta = { total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 };

export interface NotificationDeliveriesPanelProps {
  masterAdmin?: boolean;
  barbershops?: { id: string; name: string }[];
  onNotify?: (message: string, type: 'success' | 'error') => void;
}

function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('pt-BR');
}

function deliveryDestination(delivery: NotificationDelivery): string {
  return (
    delivery.destinationMasked ||
    delivery.maskedDestination ||
    delivery.recipientMasked ||
    'Destino protegido'
  );
}

function friendlyError(delivery: NotificationDelivery): string | null {
  const code = delivery.lastErrorCode || '';
  if (ERROR_LABELS[code]) return ERROR_LABELS[code];
  if (!delivery.lastError && !delivery.lastErrorMessage && !code) return null;
  return 'Não foi possível concluir o envio. Tente novamente ou revise a configuração do canal.';
}

function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type.replaceAll('_', ' ').toLocaleLowerCase('pt-BR');
}

export const NotificationDeliveriesPanel: React.FC<NotificationDeliveriesPanelProps> = ({
  masterAdmin = false,
  barbershops = [],
  onNotify,
}) => {
  const [deliveries, setDeliveries] = useState<NotificationDelivery[]>([]);
  const [meta, setMeta] = useState<NotificationListMeta>(EMPTY_META);
  const [draftFilters, setDraftFilters] = useState<Filters>(EMPTY_FILTERS);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTarget, setRetryTarget] = useState<NotificationDelivery | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const requestSequence = useRef(0);

  const loadDeliveries = useCallback(async () => {
    const sequence = ++requestSequence.current;
    setLoading(true);
    setError(null);
    const params: ListNotificationDeliveriesParams = {
      page,
      limit: PAGE_SIZE,
      channel: filters.channel || undefined,
      type: filters.type || undefined,
      status: filters.status || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
      barbershopId: masterAdmin ? filters.barbershopId || undefined : undefined,
    };

    try {
      const result = await notificationsApi.listDeliveries(params);
      if (sequence !== requestSequence.current) return;
      setDeliveries(result.data);
      setMeta(result.meta);
    } catch (cause) {
      if (sequence !== requestSequence.current) return;
      setDeliveries([]);
      setMeta({ ...EMPTY_META, page });
      setError(getErrorMessage(cause, 'Não foi possível carregar o histórico de notificações.'));
    } finally {
      if (sequence === requestSequence.current) setLoading(false);
    }
  }, [filters, masterAdmin, page]);

  useEffect(() => {
    void loadDeliveries();
    return () => {
      requestSequence.current += 1;
    };
  }, [loadDeliveries]);

  const availableTypes = useMemo(
    () => Array.from(new Set([...Object.keys(TYPE_LABELS), ...deliveries.map(item => item.type)])).sort(),
    [deliveries]
  );

  const applyFilters = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setFilters(draftFilters);
  };

  const clearFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const confirmRetry = async () => {
    if (!retryTarget) return;
    setRetrying(true);
    try {
      await notificationsApi.retryDelivery(retryTarget.id);
      const message = 'Nova tentativa adicionada à fila.';
      setFeedback(message);
      onNotify?.(message, 'success');
      setRetryTarget(null);
      await loadDeliveries();
    } catch (cause) {
      const message = getErrorMessage(cause, 'Não foi possível solicitar uma nova tentativa.');
      setFeedback(message);
      onNotify?.(message, 'error');
    } finally {
      setRetrying(false);
    }
  };

  return (
    <section className="space-y-4" aria-labelledby="notification-deliveries-title">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 id="notification-deliveries-title" className="text-lg font-bold text-text-primary">
            Histórico de entregas
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            Acompanhe o envio sem expor telefone, e-mail ou conteúdo da mensagem.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadDeliveries()}
          disabled={loading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-bold text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary disabled:opacity-50"
        >
          <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} /> Atualizar
        </button>
      </div>

      <form
        onSubmit={applyFilters}
        className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 xl:grid-cols-3"
        aria-label="Filtros de entregas"
      >
        <label className="text-xs font-semibold text-text-secondary">
          Canal
          <select
            value={draftFilters.channel}
            onChange={event =>
              setDraftFilters(current => ({
                ...current,
                channel: event.target.value as Filters['channel'],
              }))
            }
            className="mt-1 min-h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text-primary"
          >
            <option value="">Todos</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="EMAIL">E-mail</option>
          </select>
        </label>

        <label className="text-xs font-semibold text-text-secondary">
          Status
          <select
            value={draftFilters.status}
            onChange={event =>
              setDraftFilters(current => ({
                ...current,
                status: event.target.value as Filters['status'],
              }))
            }
            className="mt-1 min-h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text-primary"
          >
            <option value="">Todos</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs font-semibold text-text-secondary">
          Tipo
          <select
            value={draftFilters.type}
            onChange={event =>
              setDraftFilters(current => ({ ...current, type: event.target.value }))
            }
            className="mt-1 min-h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text-primary"
          >
            <option value="">Todos</option>
            {availableTypes.map(value => (
              <option key={value} value={value}>
                {typeLabel(value)}
              </option>
            ))}
          </select>
        </label>

        {masterAdmin && (
          <label className="text-xs font-semibold text-text-secondary">
            Salão
            <select
              value={draftFilters.barbershopId}
              onChange={event =>
                setDraftFilters(current => ({ ...current, barbershopId: event.target.value }))
              }
              className="mt-1 min-h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text-primary"
            >
              <option value="">Todos os salões</option>
              {barbershops.map(shop => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="text-xs font-semibold text-text-secondary">
          De
          <input
            type="date"
            value={draftFilters.from}
            max={draftFilters.to || undefined}
            onChange={event =>
              setDraftFilters(current => ({ ...current, from: event.target.value }))
            }
            className="mt-1 min-h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text-primary"
          />
        </label>

        <label className="text-xs font-semibold text-text-secondary">
          Até
          <input
            type="date"
            value={draftFilters.to}
            min={draftFilters.from || undefined}
            onChange={event =>
              setDraftFilters(current => ({ ...current, to: event.target.value }))
            }
            className="mt-1 min-h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text-primary"
          />
        </label>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end xl:col-span-3">
          <button
            type="submit"
            className="min-h-11 flex-1 rounded-xl bg-accent px-4 text-sm font-bold text-accent-fg hover:bg-accent-hover"
          >
            Aplicar filtros
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="min-h-11 flex-1 rounded-xl border border-border px-4 text-sm font-bold text-text-secondary hover:bg-surface-2 hover:text-text-primary"
          >
            Limpar
          </button>
        </div>
      </form>

      <p className="sr-only" aria-live="polite">
        {feedback}
      </p>

      {error ? (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4 text-danger">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm">{error}</p>
            <button type="button" onClick={() => void loadDeliveries()} className="mt-2 min-h-10 text-sm font-bold underline">
              Tentar novamente
            </button>
          </div>
        </div>
      ) : loading ? (
        <div role="status" className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-text-muted">
          Carregando entregas...
        </div>
      ) : deliveries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center">
          <BellEmptyIcon />
          <p className="mt-2 text-sm font-semibold text-text-primary">Nenhuma entrega encontrada</p>
          <p className="mt-1 text-xs text-text-muted">Ajuste os filtros ou aguarde o próximo envio.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deliveries.map(delivery => {
            const errorText = friendlyError(delivery);
            const attempts = delivery.attemptCount ?? delivery.attempts ?? 0;
            const shopName =
              delivery.barbershopName ||
              barbershops.find(shop => shop.id === delivery.barbershopId)?.name;
            return (
              <article key={delivery.id} className="min-w-0 rounded-xl border border-border bg-surface p-4">
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="rounded-lg bg-surface-2 p-2 text-text-secondary" aria-hidden="true">
                      {delivery.channel === 'WHATSAPP' ? <MessageCircle size={18} /> : <Mail size={18} />}
                    </span>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-bold text-text-primary">
                        {typeLabel(delivery.type)}
                      </p>
                      <p className="mt-0.5 break-all text-xs text-text-secondary">
                        {deliveryDestination(delivery)}
                      </p>
                      {masterAdmin && shopName && (
                        <p className="mt-1 break-words text-xs text-text-muted">Salão: {shopName}</p>
                      )}
                    </div>
                  </div>
                  <span className={`self-start rounded-full border px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLES[delivery.status]}`}>
                    {STATUS_LABELS[delivery.status] ?? delivery.status}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-1 gap-2 text-xs text-text-secondary sm:grid-cols-3">
                  <div>
                    <dt className="text-text-muted">Criada em</dt>
                    <dd className="mt-0.5 font-semibold">{formatDateTime(delivery.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Tentativas</dt>
                    <dd className="mt-0.5 font-semibold">{attempts}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Última atualização</dt>
                    <dd className="mt-0.5 font-semibold">
                      {formatDateTime(
                        delivery.readAt || delivery.deliveredAt || delivery.sentAt || delivery.failedAt || delivery.queuedAt
                      )}
                    </dd>
                  </div>
                </dl>

                {errorText && (
                  <p className="mt-3 rounded-lg bg-danger/10 p-3 text-xs text-danger" role="status">
                    {errorText}
                  </p>
                )}

                {delivery.status === 'FAILED' && (
                  <button
                    type="button"
                    onClick={() => setRetryTarget(delivery)}
                    className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-bold text-text-primary hover:border-accent hover:text-accent sm:w-auto"
                  >
                    <RotateCcw size={16} /> Tentar novamente
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}

      {!error && meta.total > 0 && (
        <nav className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 sm:flex-row sm:items-center sm:justify-between" aria-label="Paginação das entregas">
          <p className="text-center text-xs text-text-muted sm:text-left">
            {meta.total} entrega(s) · página {meta.page} de {Math.max(1, meta.totalPages)}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPage(current => Math.max(1, current - 1))}
              disabled={loading || page <= 1}
              className="inline-flex min-h-11 items-center justify-center gap-1 rounded-lg border border-border px-3 text-sm font-bold text-text-secondary disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <button
              type="button"
              onClick={() => setPage(current => current + 1)}
              disabled={loading || page >= meta.totalPages}
              className="inline-flex min-h-11 items-center justify-center gap-1 rounded-lg border border-border px-3 text-sm font-bold text-text-secondary disabled:opacity-40"
            >
              Próxima <ChevronRight size={16} />
            </button>
          </div>
        </nav>
      )}

      <ConfirmDialog
        open={Boolean(retryTarget)}
        title="Tentar enviar novamente?"
        message="Uma nova entrega será criada e o histórico desta tentativa será preservado."
        confirmLabel="Confirmar tentativa"
        cancelLabel="Voltar"
        variant="default"
        loading={retrying}
        onCancel={() => {
          if (!retrying) setRetryTarget(null);
        }}
        onConfirm={() => void confirmRetry()}
      />
    </section>
  );
};

const BellEmptyIcon: React.FC = () => (
  <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-text-muted" aria-hidden="true">
    <Mail size={18} />
  </span>
);
