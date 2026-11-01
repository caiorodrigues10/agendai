import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { crmApi, CrmBackfillRun, CrmBackfillResult } from '../../infra/crmApi';
import {
  adminCrmApi,
  AdminCrmBackfillRun,
  CrmBackfillRunStatus,
  CrmBackfillScope,
} from '../../infra/adminCrmApi';
import { CrmBackfillSchema } from '../../schemas';
import { getErrorMessage } from '../../utils/errorMessage';
import { Field, FIELD_CONTROL } from '../../components/ui/Field';
import { DataTableState } from '../../components/patterns/states/DataTableState';
import { PaginationBar } from '../../components/ui/PaginationBar';

const statusLabel = (status: string) => ({ RUNNING: 'Em andamento', SUCCEEDED: 'Concluído', FAILED: 'Falhou' }[status] || 'Status indisponível');
const scopeLabel = (scope: string) => (scope === 'GLOBAL' ? 'Global' : 'Salão');
function RunSummary({ run }: { run: CrmBackfillRun }) {
  return <div className="space-y-1">
    <p className="font-semibold">{statusLabel(run.status)} · {new Date(run.startedAt).toLocaleString('pt-BR')}</p>
    <p>{run.linkedRecords} vínculos · {run.createdEvents} novos eventos · {run.totalEvents} eventos no total</p>
    {run.error && <p className="break-words text-danger">{run.error}</p>}
  </div>;
}

const HISTORY_PAGE_SIZE = 10;

export function CrmBackfillPanel({ global = false, onUpdated, onClose }: { global?: boolean; onUpdated?: () => void; onClose?: () => void }) {
  const { user } = useAuth();
  const allowed = global ? user?.role === 'MASTER_ADMIN' : user?.role === 'OWNER';
  const [runs, setRuns] = useState<CrmBackfillRun[]>([]);
  const [results, setResults] = useState<CrmBackfillResult[] | null>(null);
  const [result, setResult] = useState<CrmBackfillRun | null>(null);
  const [error, setError] = useState('');
  const [historyError, setHistoryError] = useState('');
  const [loading, setLoading] = useState(false);
  const lock = useRef(false);
  const { register, handleSubmit, reset, formState: { isSubmitting, isValid, errors } } = useForm<z.infer<typeof CrmBackfillSchema>>({ resolver: zodResolver(CrmBackfillSchema), mode: 'onChange' });

  const [adminRuns, setAdminRuns] = useState<AdminCrmBackfillRun[]>([]);
  const [adminMeta, setAdminMeta] = useState({ total: 0, page: 1, limit: HISTORY_PAGE_SIZE, totalPages: 1, running: 0, runningGlobal: 0 });
  const [historyPage, setHistoryPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<CrmBackfillRunStatus | ''>('');
  const [scopeFilter, setScopeFilter] = useState<CrmBackfillScope | ''>('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);

  const loadRuns = useCallback(async () => {
    if (!allowed || global) return;
    setLoading(true); setHistoryError('');
    try { setRuns(await crmApi.backfillRuns()); }
    catch (err) { setHistoryError(getErrorMessage(err)); }
    finally { setLoading(false); }
  }, [allowed, global]);
  useEffect(() => { void loadRuns(); }, [loadRuns]);

  const loadAdminRuns = useCallback(async () => {
    if (!allowed || !global) return;
    setHistoryLoading(true); setHistoryError('');
    try {
      const response = await adminCrmApi.backfillRuns({
        page: historyPage,
        limit: HISTORY_PAGE_SIZE,
        status: statusFilter || undefined,
        scope: scopeFilter || undefined,
      });
      setAdminRuns(response.data);
      setAdminMeta(response.meta);
    } catch (err) { setHistoryError(getErrorMessage(err)); }
    finally { setHistoryLoading(false); }
  }, [allowed, global, historyPage, statusFilter, scopeFilter]);
  useEffect(() => { void loadAdminRuns(); }, [loadAdminRuns]);

  const runningGlobal = adminMeta.runningGlobal > 0;

  const submit = handleSubmit(async () => {
    if (!allowed || lock.current) return;
    lock.current = true; setError(''); setResult(null); setResults(null);
    try {
      if (global) setResults(await crmApi.backfillAll());
      else setResult(await crmApi.backfill());
      reset({ confirmation: undefined });
      onUpdated?.();
    } catch (err) { setError(getErrorMessage(err)); }
    finally { await loadRuns(); await loadAdminRuns(); lock.current = false; }
  });
  if (!allowed) return null;
  return <section className="space-y-4 rounded-xl border border-border bg-surface p-4 text-sm text-text-primary">
    <div className="flex items-center justify-between">
      <h3 className="font-bold">{global ? 'Reprocessamento global do CRM' : 'Manutenção do histórico do salão'}</h3>
      {onClose && <button type="button" onClick={onClose} className="rounded-lg p-1 text-text-muted hover:bg-bg" aria-label="Fechar">✕</button>}
    </div>
    <p className="text-text-secondary">{global ? 'Reconstrói vínculos e eventos financeiros de todos os salões ativos. A execução pode demorar; o resultado informa falhas por salão.' : 'Reconstrói vínculos de clientes e eventos financeiros do seu salão a partir dos registros existentes.'}</p>
    <form onSubmit={submit} className="space-y-3">
      <Field label="Digite REPROCESSAR para confirmar" error={errors.confirmation?.message}><input aria-label="Digite REPROCESSAR para confirmar" autoComplete="off" className={FIELD_CONTROL} disabled={isSubmitting} {...register('confirmation')} /></Field>
      <button disabled={!isValid || isSubmitting || (global && runningGlobal)} className="min-h-11 rounded-lg bg-accent px-4 font-bold text-accent-fg disabled:opacity-40">{isSubmitting ? 'Reprocessando…' : global ? (runningGlobal ? 'Reprocessamento em andamento…' : 'Reprocessar todos os salões ativos') : 'Reprocessar histórico do salão'}</button>
    </form>
    {global && runningGlobal && (
      <p role="status" className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-warning">
        Há um reprocessamento em andamento. Aguarde a conclusão para disparar outro.
      </p>
    )}
    {error && <p role="alert" className="text-danger">{error}</p>}
    {result && <div role="status"><RunSummary run={result} /></div>}
    {results && <div className="space-y-2" role="status">
      <p className="font-bold">{results.length} salões · {results.filter(item => item.run?.status === 'SUCCEEDED').length} concluídos · {results.filter(item => item.error !== undefined || item.run?.status === 'FAILED').length} falhas</p>
      {results.map(item => <div key={item.barbershopId} className="rounded-lg border border-border p-3"><p className="break-all text-text-muted">Salão: {item.barbershopId}</p>{item.run ? <RunSummary run={item.run} /> : <p className="break-words text-danger">{item.error}</p>}</div>)}
    </div>}
    {global ? <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-bold">Histórico de execuções</h4>
        <button type="button" disabled={historyLoading || isSubmitting} onClick={() => void loadAdminRuns()} className="min-h-11 px-3 text-accent disabled:opacity-40">Atualizar histórico</button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="Filtrar por status"
          value={statusFilter}
          onChange={(event) => { setStatusFilter(event.target.value as CrmBackfillRunStatus | ''); setHistoryPage(1); }}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-secondary"
        >
          <option value="">Todos os status</option>
          <option value="RUNNING">Em andamento</option>
          <option value="SUCCEEDED">Concluído</option>
          <option value="FAILED">Falhou</option>
        </select>
        <select
          aria-label="Filtrar por escopo"
          value={scopeFilter}
          onChange={(event) => { setScopeFilter(event.target.value as CrmBackfillScope | ''); setHistoryPage(1); }}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-secondary"
        >
          <option value="">Todos os escopos</option>
          <option value="TENANT">Por salão</option>
          <option value="GLOBAL">Global</option>
        </select>
      </div>
      <DataTableState
        loading={historyLoading && adminRuns.length === 0}
        error={historyError}
        isEmpty={!historyLoading && !historyError && adminRuns.length === 0}
        emptyTitle="Nenhuma execução registrada"
        emptyDescription="Dispare um reprocessamento para registrar a primeira execução."
        onRetry={() => void loadAdminRuns()}
      />
      {!historyLoading && !historyError && adminRuns.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg/60 text-text-muted">
              <tr>
                <th scope="col" className="px-3 py-2 font-bold">Início</th>
                <th scope="col" className="px-3 py-2 font-bold">Escopo</th>
                <th scope="col" className="px-3 py-2 font-bold">Salão</th>
                <th scope="col" className="px-3 py-2 font-bold">Status</th>
                <th scope="col" className="px-3 py-2 font-bold">Contadores</th>
                <th scope="col" className="px-3 py-2 font-bold">Quem disparou</th>
                <th scope="col" className="px-3 py-2 font-bold">Detalhe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {adminRuns.map((run) => (
                <tr key={run.id} className="align-top">
                  <td className="px-3 py-2">{new Date(run.startedAt).toLocaleString('pt-BR')}</td>
                  <td className="px-3 py-2">{scopeLabel(run.scope)}</td>
                  <td className="px-3 py-2 break-all">{run.barbershopName ?? run.barbershopId}</td>
                  <td className="px-3 py-2">
                    <span className={run.status === 'FAILED' ? 'text-danger' : run.status === 'RUNNING' ? 'text-warning' : 'text-success'}>
                      {statusLabel(run.status)}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {run.linkedRecords} vínculos · {run.createdEvents} novos · {run.totalEvents} no total
                  </td>
                  <td className="px-3 py-2">{run.triggeredBy?.name ?? '—'}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setExpandedRun((current) => (current === run.id ? null : run.id))}
                      className="text-accent hover:underline"
                    >
                      {expandedRun === run.id ? 'Ocultar' : 'Ver'}
                    </button>
                    {expandedRun === run.id && (
                      <div className="mt-1 space-y-1 text-text-secondary">
                        <p>Fim: {run.completedAt ? new Date(run.completedAt).toLocaleString('pt-BR') : 'em andamento'}</p>
                        <p>Versão: {run.version}</p>
                        {run.error && <p className="break-words text-danger">{run.error}</p>}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {adminMeta.totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 text-xs text-text-muted">
          <span>{adminMeta.total} execução(ões) · página {adminMeta.page} de {adminMeta.totalPages}</span>
          <PaginationBar page={adminMeta.page} totalPages={adminMeta.totalPages} onPageChange={(page) => setHistoryPage(page)} />
        </div>
      )}
    </div> : <div className="space-y-2">
      <div className="flex items-center justify-between gap-2"><h4 className="font-bold">Últimas 20 execuções</h4><button type="button" disabled={loading || isSubmitting} onClick={() => void loadRuns()} className="min-h-11 px-3 text-accent disabled:opacity-40">Atualizar histórico</button></div>
      {loading && <p role="status">Carregando histórico…</p>}
      {historyError && <p role="alert" className="text-danger">{historyError}</p>}
      {!loading && !historyError && !runs.length && <p className="text-text-muted">Nenhuma execução registrada.</p>}
      {runs.map(run => <div key={run.id} className="rounded-lg border border-border bg-bg p-3"><RunSummary run={run} /></div>)}
    </div>}
  </section>;
}
