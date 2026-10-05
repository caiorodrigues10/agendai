import React, { useCallback, useEffect, useState } from 'react';
import { LuLoader, LuRefreshCcw, LuTriangleAlert } from 'react-icons/lu';
import { adminEngagementApi, EngagementSummary } from '../../infra/adminEngagementApi';
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

  const reload = useCallback(() => {
    setError(null);
    setReloadKey((key) => key + 1);
  }, []);

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

  if (!summary && !error) {
    return (
      <div className="flex justify-center py-16">
        <LuLoader className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="text-center py-16">
        <LuTriangleAlert className="mx-auto mb-2 text-warning" size={22} />
        <p className="text-sm text-text-secondary">{error}</p>
        <button
          type="button"
          onClick={reload}
          className="mt-2 inline-flex items-center gap-1 text-accent text-sm font-bold hover:underline"
        >
          <LuRefreshCcw size={14} /> Tentar novamente
        </button>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Engajamento</h1>
          <p className="text-xs text-text-muted">
            Visão de funil, adoção, NPS, suporte e churn · atualizado em{' '}
            {new Date(summary.generatedAt).toLocaleString('pt-BR', {
              dateStyle: 'short',
              timeStyle: 'short',
              timeZone: 'America/Sao_Paulo',
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={reload}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-text-secondary hover:bg-bg"
        >
          <LuRefreshCcw size={14} /> Atualizar
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FunnelCard funnel={summary.funnel} />
        <SupportCard support={summary.support} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FeaturesCard features={summary.features} />
        <NpsCard nps={summary.nps} />
      </div>

      <ChurnRiskCard churnRisk={summary.churnRisk} />
    </div>
  );
};

export default EngagementPage;
