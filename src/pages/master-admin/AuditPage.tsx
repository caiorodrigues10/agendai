import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  LuArrowRight,
  LuClock3,
  LuDownload,
  LuHistory,
  LuLoader,
  LuRefreshCcw,
  LuSearch,
  LuShield,
  LuTriangleAlert,
  LuUserRound,
} from 'react-icons/lu';
import {
  adminAuditApi,
  AuditFacets,
  AuditFilterValues,
  AuditLogsResponse,
  buildAuditFilterParams,
} from '../../infra/adminAuditApi';
import { Button } from '../../components/ui/Button';
import { PaginationBar } from '../../components/ui/PaginationBar';
import { SectionError } from '../../components/patterns';
import { AuditAlertsPanel, AuditSessionsPanel } from './AuditAdvancedPanels';
import { AuditDetailModal } from './AuditDetailModal';
import { AuditFilters } from './AuditFilters';
import {
  auditActorLabel,
  auditDetailSummary,
  auditResourceLabel,
  describeAuditAction,
} from './auditPresentation';

const PAGE_SIZE = 25;
const number = (value: number) => value.toLocaleString('pt-BR');
const eventTone = {
  neutral: 'border-border bg-surface-2 text-text-secondary',
  info: 'border-accent/20 bg-accent/10 text-accent',
  warning: 'border-warning/25 bg-warning/10 text-warning',
  danger: 'border-danger/25 bg-danger/10 text-danger',
};
const dateParts = (iso: string) => ({
  date: new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
  time: new Date(iso).toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  }),
});

const AuditLogList: React.FC<{
  logs: AuditLogsResponse['data'];
  facets: AuditFacets;
  hasFilters: boolean;
  onClear: () => void;
  onSelect: (log: AuditLogsResponse['data'][number]) => void;
}> = ({ logs, facets, hasFilters, onClear, onSelect }) => {
  if (logs.length === 0)
    return (
      <div className="px-6 py-14 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-text-secondary">
          <LuSearch size={22} aria-hidden="true" />
        </div>
        <p className="font-semibold text-text-primary">Nenhum registro encontrado.</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">
          {hasFilters
            ? 'Experimente outro termo ou amplie o período da busca.'
            : 'As atividades aparecerão aqui conforme forem registradas.'}
        </p>
        {hasFilters && (
          <Button variant="secondary" className="mt-5" onClick={onClear}>
            Limpar filtros
          </Button>
        )}
      </div>
    );
  return (
    <ul className="divide-y divide-border/70" aria-label="Registros de auditoria">
      {logs.map(log => {
        const action = describeAuditAction(log.action, log.resource);
        const created = dateParts(log.createdAt);
        return (
          <li key={log.id}>
            <button
              type="button"
              onClick={() => onSelect(log)}
              aria-label={`Detalhes: ${action.label}`}
              className="group flex w-full min-w-0 items-start gap-3 px-4 py-5 text-left outline-none transition-colors hover:bg-surface-2/60 focus-visible:bg-surface-2 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus sm:gap-4 sm:px-6"
            >
              <span
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${eventTone[action.tone]}`}
              >
                {action.tone === 'danger' || action.tone === 'warning' ? (
                  <LuShield size={18} aria-hidden="true" />
                ) : (
                  <LuHistory size={18} aria-hidden="true" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <span className="text-sm font-semibold text-text-primary">{action.label}</span>
                  <span className="rounded-md border border-border bg-bg px-2 py-0.5 text-xs text-text-secondary">
                    {auditResourceLabel(log.resource)}
                  </span>
                </span>
                <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
                  <span className="inline-flex items-center gap-1.5">
                    <LuUserRound size={13} aria-hidden="true" />
                    {auditActorLabel(log.userId, facets.users)}
                  </span>
                  {log.barbershopId && (
                    <span className="min-w-0 truncate">
                      {facets.shops.find(shop => shop.id === log.barbershopId)?.name ??
                        'Salão não identificado'}
                    </span>
                  )}
                </span>
                {log.details && (
                  <span className="mt-2 line-clamp-2 break-words text-sm leading-relaxed text-text-secondary">
                    {auditDetailSummary(log.details)}
                  </span>
                )}
                <span className="mt-2 block truncate font-mono text-[11px] text-text-muted">
                  {log.action}
                </span>
                <time
                  dateTime={log.createdAt}
                  className="mt-2 block text-xs text-text-secondary sm:hidden"
                >
                  {created.date} às {created.time}
                </time>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-3 pt-0.5">
                <time
                  dateTime={log.createdAt}
                  className="hidden text-right text-xs leading-relaxed text-text-secondary sm:block"
                >
                  <span className="block">{created.date}</span>
                  <span className="text-text-muted">{created.time}</span>
                </time>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
                  <span className="hidden sm:inline">Detalhes</span>
                  <LuArrowRight size={16} className="shrink-0" aria-hidden="true" />
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

const readFilters = (params: URLSearchParams): AuditFilterValues => ({
  q: params.get('q') ?? '',
  action: params.get('action') ?? '',
  resource: params.get('resource') ?? '',
  userId: params.get('userId') ?? '',
  shopId: params.get('shopId') ?? '',
  from: params.get('from') ?? '',
  to: params.get('to') ?? '',
});

export const AuditPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [response, setResponse] = useState<AuditLogsResponse | null>(null);
  const [requestError, setRequestError] = useState<{ key: string; message: string } | null>(null);
  const [settledKey, setSettledKey] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [facets, setFacets] = useState<AuditFacets>({ resources: [], users: [], shops: [] });
  const [selectedLog, setSelectedLog] = useState<AuditLogsResponse['data'][number] | null>(null);
  const values = readFilters(searchParams);
  const { q, action, resource, userId, shopId, from, to } = values;
  const signature = JSON.stringify(values);
  const pageParam = Number(searchParams.get('page') ?? '1');
  const page = Number.isFinite(pageParam) && pageParam >= 1 ? Math.floor(pageParam) : 1;
  const requestKey = `${signature}:${page}:${reloadKey}`;
  const busy = settledKey !== requestKey;
  const error = requestError?.key === requestKey ? requestError.message : null;
  const hasFilters = Object.values(values).some(Boolean);

  const setParams = (patch: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (!value) next.delete(key);
      else next.set(key, value);
    });
    setSearchParams(next, { replace: true });
  };
  const apply = (filters: AuditFilterValues) => setParams({ ...filters, page: '1' });
  const clear = () =>
    apply({ q: '', action: '', resource: '', userId: '', shopId: '', from: '', to: '' });

  useEffect(() => {
    let active = true;
    adminAuditApi
      .getAuditFacets()
      .then(res => {
        if (active) setFacets(res.data);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    adminAuditApi
      .getAuditLogs({
        page,
        limit: PAGE_SIZE,
        ...buildAuditFilterParams({ q, action, resource, userId, shopId, from, to }),
      })
      .then(res => {
        if (!active) return;
        setResponse(res);
        setRequestError(null);
        setSettledKey(requestKey);
      })
      .catch(() => {
        if (!active) return;
        setRequestError({
          key: requestKey,
          message: 'Não foi possível carregar os logs de auditoria.',
        });
        setSettledKey(requestKey);
      });
    return () => {
      active = false;
    };
  }, [q, action, resource, userId, shopId, from, to, page, reloadKey, requestKey]);

  const handleExport = () => {
    setExporting(true);
    setExportError(null);
    adminAuditApi
      .exportAuditLogsCsv(buildAuditFilterParams(values))
      .then(async res => {
        if (!res.ok) throw new Error('Falha no export');
        const blob = new Blob([await res.blob()], { type: 'text/csv;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `auditoria-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => setExportError('Não foi possível exportar os registros.'))
      .finally(() => setExporting(false));
  };
  const meta = response?.meta;
  const first = meta?.total && response?.data.length ? (meta.page - 1) * meta.limit + 1 : 0;
  const last =
    meta && response?.data.length ? Math.min(first + response.data.length - 1, meta.total) : 0;

  return (
    <div className="min-w-0 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Segurança e rastreabilidade
          </p>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-text-primary">
            <LuShield size={25} className="text-accent" aria-hidden="true" />
            Auditoria
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
            Acompanhe as atividades, investigue alterações e gerencie os acessos.
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <Button
            variant="secondary"
            onClick={() => setReloadKey(key => key + 1)}
            disabled={busy}
            className="flex-1 sm:flex-none"
          >
            <LuRefreshCcw size={16} aria-hidden="true" />
            Atualizar registros
          </Button>
          <Button
            variant="secondary"
            onClick={handleExport}
            disabled={exporting || busy || !!error || !meta?.total}
            className="flex-1 sm:flex-none"
          >
            <LuDownload size={16} aria-hidden="true" />
            {exporting ? 'Exportando…' : 'Exportar CSV'}
          </Button>
        </div>
      </header>
      {exportError && <SectionError message={exportError} />}
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <AuditAlertsPanel />
        <AuditSessionsPanel />
      </div>
      <section
        className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
        aria-labelledby="audit-history-title"
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-5 sm:px-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2
                id="audit-history-title"
                className="flex items-center gap-2 text-base font-semibold text-text-primary"
              >
                <LuHistory size={18} className="text-text-secondary" aria-hidden="true" />
                Histórico de atividades
              </h2>
              {meta && (
                <span className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-medium text-text-secondary">
                  {number(meta.total)} {meta.total === 1 ? 'registro' : 'registros'}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
              Do mais recente ao mais antigo. Selecione um registro para investigar.
            </p>
          </div>
          <span
            role="status"
            aria-live="polite"
            className="inline-flex min-h-6 items-center gap-1.5 text-xs text-text-secondary"
          >
            {busy ? (
              <>
                <LuLoader
                  size={14}
                  className="animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                Atualizando registros…
              </>
            ) : (
              <>
                <LuClock3 size={14} aria-hidden="true" />
                Horário de Brasília
              </>
            )}
          </span>
        </div>
        <AuditFilters
          values={values}
          facets={facets}
          busy={busy}
          onApply={apply}
          onClear={clear}
          onRemove={key => setParams({ [key]: '', page: '1' })}
        />
        <div aria-busy={busy}>
          {error && (
            <div
              className="m-4 space-y-2 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-text-primary"
              role="alert"
            >
              <p className="flex items-start gap-2">
                <LuTriangleAlert
                  size={18}
                  className="mt-0.5 shrink-0 text-warning"
                  aria-hidden="true"
                />
                {error}
              </p>
              {response && (
                <p className="text-xs text-text-secondary">
                  Os registros abaixo são da consulta anterior.
                </p>
              )}
              <Button variant="secondary" onClick={() => setReloadKey(key => key + 1)}>
                Tentar novamente
              </Button>
            </div>
          )}
          {busy && !response ? (
            <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-text-secondary">
              <LuLoader
                size={22}
                className="animate-spin motion-reduce:animate-none text-accent"
                aria-hidden="true"
              />
              Carregando histórico…
            </div>
          ) : (
            response && (
              <div className={busy ? 'opacity-60' : ''}>
                <AuditLogList
                  logs={response.data}
                  facets={facets}
                  hasFilters={hasFilters}
                  onClear={clear}
                  onSelect={setSelectedLog}
                />
              </div>
            )
          )}
        </div>
        {meta && (
          <footer className="space-y-4 border-t border-border bg-bg/30 px-4 py-4 sm:px-6">
            <p className="text-xs text-text-secondary" aria-live="polite">
              {number(first)}–{number(last)} de {number(meta.total)} registros
              {hasFilters ? ' encontrados' : ''}
            </p>
            <fieldset disabled={busy} aria-label="Navegar pelo histórico" className="min-w-0">
              <PaginationBar
                page={meta.page}
                totalPages={meta.totalPages}
                onPageChange={next => setParams({ page: String(next) })}
                className={busy ? 'opacity-50' : ''}
              />
            </fieldset>
          </footer>
        )}
      </section>
      <AuditDetailModal
        log={selectedLog}
        users={facets.users}
        shops={facets.shops}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
};
export default AuditPage;
