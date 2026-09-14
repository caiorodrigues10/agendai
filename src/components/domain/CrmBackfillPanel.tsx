import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { crmApi, CrmBackfillRun, CrmBackfillResult } from '../../infra/crmApi';
import { CrmBackfillSchema } from '../../schemas';
import { getErrorMessage } from '../../utils/errorMessage';
import { Field, FIELD_CONTROL } from '../ui/Field';

const statusLabel = (status: string) => ({ RUNNING: 'Em andamento', SUCCEEDED: 'Concluído', FAILED: 'Falhou' }[status] || 'Status indisponível');
function RunSummary({ run }: { run: CrmBackfillRun }) {
  return <div className="space-y-1">
    <p className="font-semibold">{statusLabel(run.status)} · {new Date(run.startedAt).toLocaleString('pt-BR')}</p>
    <p>{run.linkedRecords} vínculos · {run.createdEvents} novos eventos · {run.totalEvents} eventos no total</p>
    {run.error && <p className="break-words text-danger">{run.error}</p>}
  </div>;
}

export function CrmBackfillPanel({ global = false, onUpdated }: { global?: boolean; onUpdated?: () => void }) {
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
  const loadRuns = useCallback(async () => {
    if (!allowed || global) return;
    setLoading(true); setHistoryError('');
    try { setRuns(await crmApi.backfillRuns()); }
    catch (err) { setHistoryError(getErrorMessage(err)); }
    finally { setLoading(false); }
  }, [allowed, global]);
  useEffect(() => { void loadRuns(); }, [loadRuns]);
  const submit = handleSubmit(async () => {
    if (!allowed || lock.current) return;
    lock.current = true; setError(''); setResult(null); setResults(null);
    try {
      if (global) setResults(await crmApi.backfillAll());
      else setResult(await crmApi.backfill());
      reset({ confirmation: undefined });
      onUpdated?.();
    } catch (err) { setError(getErrorMessage(err)); }
    finally { await loadRuns(); lock.current = false; }
  });
  if (!allowed) return null;
  return <section className="space-y-4 rounded-xl border border-border bg-surface p-4 text-sm text-text-primary">
    <h3 className="font-bold">{global ? 'Reprocessamento global do CRM' : 'Manutenção do histórico do salão'}</h3>
    <p className="text-text-secondary">{global ? 'Reconstrói vínculos e eventos financeiros de todos os salões ativos. A execução pode demorar; o resultado informa falhas por salão.' : 'Reconstrói vínculos de clientes e eventos financeiros do seu salão a partir dos registros existentes.'}</p>
    <form onSubmit={submit} className="space-y-3">
      <Field label="Digite REPROCESSAR para confirmar" error={errors.confirmation?.message}><input aria-label="Digite REPROCESSAR para confirmar" autoComplete="off" className={FIELD_CONTROL} disabled={isSubmitting} {...register('confirmation')} /></Field>
      <button disabled={!isValid || isSubmitting} className="min-h-11 rounded-lg bg-accent px-4 font-bold text-accent-fg disabled:opacity-40">{isSubmitting ? 'Reprocessando…' : global ? 'Reprocessar todos os salões ativos' : 'Reprocessar histórico do salão'}</button>
    </form>
    {error && <p role="alert" className="text-danger">{error}</p>}
    {result && <div role="status"><RunSummary run={result} /></div>}
    {results && <div className="space-y-2" role="status">
      <p className="font-bold">{results.length} salões · {results.filter(item => item.run?.status === 'SUCCEEDED').length} concluídos · {results.filter(item => item.error !== undefined || item.run?.status === 'FAILED').length} falhas</p>
      {results.map(item => <div key={item.barbershopId} className="rounded-lg border border-border p-3"><p className="break-all text-text-muted">Salão: {item.barbershopId}</p>{item.run ? <RunSummary run={item.run} /> : <p className="break-words text-danger">{item.error}</p>}</div>)}
    </div>}
    {!global && <div className="space-y-2">
      <div className="flex items-center justify-between gap-2"><h4 className="font-bold">Últimas 20 execuções</h4><button type="button" disabled={loading || isSubmitting} onClick={() => void loadRuns()} className="min-h-11 px-3 text-accent disabled:opacity-40">Atualizar histórico</button></div>
      {loading && <p role="status">Carregando histórico…</p>}
      {historyError && <p role="alert" className="text-danger">{historyError}</p>}
      {!loading && !historyError && !runs.length && <p className="text-text-muted">Nenhuma execução registrada.</p>}
      {runs.map(run => <div key={run.id} className="rounded-lg border border-border bg-bg p-3"><RunSummary run={run} /></div>)}
    </div>}
  </section>;
}
