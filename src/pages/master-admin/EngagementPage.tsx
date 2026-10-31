import React, { useCallback, useEffect, useState } from 'react';
import { LuRefreshCcw } from 'react-icons/lu';
import { ApiError } from '../../infra/apiClient';
import { adminEngagementApi, type EngagementBilling, type EngagementBillingFilter, type EngagementSummary } from '../../infra/adminEngagementApi';
import { CardSkeleton } from '../../components/patterns/skeletons/CardSkeleton';
import { SectionError } from '../../components/patterns/states/SectionError';
import { EngagementBillingPanel } from './EngagementBillingPanel';
import {
  FunnelCard,
  FeaturesCard,
  NpsCard,
  SupportCard,
  ChurnRiskCard,
} from './EngagementPanels';

/** Painel master de engajamento: funil, adoção, NPS, SLA de suporte e churn. */
export const EngagementPage: React.FC = () => {
  const [summary, setSummary] = useState<EngagementSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [billing, setBilling] = useState<EngagementBilling | null>(null);
  const [billingError, setBillingError] = useState<'forbidden' | 'error' | null>(null);
  const [billingLoading, setBillingLoading] = useState(true);
  const [loadedBillingQuery, setLoadedBillingQuery] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState(false);
  const [filter, setFilter] = useState<EngagementBillingFilter>('all');
  const [search, setSearch] = useState('');
  const [querySearch, setQuerySearch] = useState('');
  const billingQuery = `${filter}:${querySearch}`;

  const reload = useCallback(() => {
    setError(null);
    setBillingError(null);
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setQuerySearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    adminEngagementApi
      .getEngagementSummary()
      .then((res) => {
        if (!active) return;
        setSummary(res.data);
        setError(null);
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar o engajamento.');
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    let active = true;
    setBillingLoading(true);
    setMoreError(false);
    adminEngagementApi.getBilling({ search: querySearch, filter })
      .then((res) => {
        if (!active) return;
        setBilling(res.data);
        setLoadedBillingQuery(billingQuery);
        setBillingError(null);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setBillingError(cause instanceof ApiError && cause.statusCode === 403 ? 'forbidden' : 'error');
      })
      .finally(() => { if (active) setBillingLoading(false); });
    return () => { active = false; };
  }, [reloadKey, filter, querySearch, billingQuery]);

  const loadMore = useCallback(async () => {
    if (!billing?.nextCursor || loadingMore || loadedBillingQuery !== billingQuery) return;
    setLoadingMore(true);
    setMoreError(false);
    try {
      const res = await adminEngagementApi.getBilling({ search: querySearch, filter, cursor: billing.nextCursor });
      setBilling((current) => current?.nextCursor === billing.nextCursor
        ? { ...res.data, shops: [...current.shops, ...res.data.shops] }
        : current);
    } catch {
      setMoreError(true);
    } finally {
      setLoadingMore(false);
    }
  }, [billing, billingQuery, filter, loadedBillingQuery, loadingMore, querySearch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Engajamento</h1>
          <p className="text-xs text-text-muted">
            Assinaturas, pagamentos e uso da plataforma{summary ? ' · atualizado em ' : ''}
            {summary && new Date(summary.generatedAt).toLocaleString('pt-BR', {
              dateStyle: 'short',
              timeStyle: 'short',
              timeZone: 'America/Sao_Paulo',
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={reload}
          disabled={billingLoading}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-text-secondary hover:bg-bg disabled:opacity-50"
        >
          <LuRefreshCcw size={14} aria-hidden="true" /> Atualizar
        </button>
      </div>

      {billingError === 'forbidden' ? (
        <div className="rounded-xl border border-border bg-surface p-4 text-sm text-text-secondary">
          Os dados financeiros exigem permissão de leitura do faturamento.
        </div>
      ) : billingError === 'error' && (!billing || loadedBillingQuery !== billingQuery) ? (
        <SectionError message="Não foi possível carregar os dados de assinaturas e pagamentos." onRetry={reload} />
      ) : billing && loadedBillingQuery === billingQuery ? (
        <>
          {billingError === 'error' && <SectionError message="Falha ao atualizar os dados financeiros. Os números abaixo podem estar desatualizados." onRetry={reload} />}
          <EngagementBillingPanel
            data={billing}
            filter={filter}
            onFilterChange={setFilter}
            search={search}
            onSearchChange={setSearch}
            refreshing={billingLoading}
            loadingMore={loadingMore}
            onLoadMore={() => void loadMore()}
            moreError={moreError}
          />
        </>
      ) : (
        <div aria-label="Carregando dados financeiros" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <CardSkeleton key={index} variant="stat" />)}
        </div>
      )}

      <section className="space-y-4" aria-label="Uso e experiência dos salões">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Uso e experiência</h2>
          <p className="text-sm text-text-muted">Ativação, adoção, suporte e satisfação dos salões.</p>
        </div>
        {error && <SectionError message={error} onRetry={reload} />}
        {summary ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <FunnelCard funnel={summary.funnel} />
              <SupportCard support={summary.support} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FeaturesCard features={summary.features} />
              <NpsCard nps={summary.nps} />
            </div>
            <ChurnRiskCard churnRisk={summary.churnRisk} />
          </>
        ) : !error ? (
          <div className="grid gap-4 md:grid-cols-2">
            <CardSkeleton /><CardSkeleton />
          </div>
        ) : null}
      </section>

    </div>
  );
};

export default EngagementPage;
