import React, { useEffect, useState } from 'react';
import { LuDownload, LuLoader, LuRefreshCcw, LuTriangleAlert } from 'react-icons/lu';
import { adminApi, BillingInsights } from '../../infra/adminApi';

const brl = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const pct = (value: number): string =>
  `${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

interface CardProps {
  title: string;
  hint?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, hint, children }) => (
  <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
    <div>
      <h3 className="text-sm font-bold text-text-primary">{title}</h3>
      {hint && <p className="text-xs text-text-muted mt-0.5">{hint}</p>}
    </div>
    {children}
  </div>
);

const Tile: React.FC<{ label: string; value: string; tone?: string }> = ({ label, value, tone }) => (
  <div className="bg-bg border border-border rounded-lg p-3">
    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{label}</p>
    <p className={`text-lg font-bold mt-1 ${tone ?? 'text-text-primary'}`}>{value}</p>
  </div>
);

const AgingCard: React.FC<{ aging: BillingInsights['aging'] }> = ({ aging }) => {
  const max = Math.max(...aging.buckets.map((b) => b.amount), 1);
  return (
    <Card
      title="Inadimplência por faixa"
      hint={`${brl(aging.totalAmount)} em ${aging.totalCount} fatura(s) vencida(s)`}
    >
      <div className="space-y-2">
        {aging.buckets.map((bucket) => (
          <div key={bucket.key} className="grid grid-cols-[80px_1fr_auto] items-center gap-3 text-xs">
            <span className="font-bold text-text-secondary">{bucket.label}</span>
            <div className="h-2.5 rounded-full bg-bg overflow-hidden">
              <div
                className="h-full rounded-full bg-danger/70"
                style={{ width: `${Math.round((bucket.amount / max) * 100)}%` }}
              />
            </div>
            <span className="text-text-primary font-medium tabular-nums">
              {brl(bucket.amount)} <span className="text-text-muted">({bucket.count})</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

const CohortsCard: React.FC<{ cohorts: BillingInsights['cohorts'] }> = ({ cohorts }) => (
  <Card title="Coortes de assinaturas" hint="Retenção da base atual por mês de contratação">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="text-text-muted uppercase tracking-widest font-bold">
          <tr>
            <th className="py-2 pr-4">Mês</th>
            <th className="py-2 pr-4">Assinaturas</th>
            <th className="py-2 pr-4">Retidas</th>
            <th className="py-2 pr-4">Canceladas</th>
            <th className="py-2">Retenção</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {cohorts.map((cohort) => (
            <tr key={cohort.month}>
              <td className="py-2 pr-4 font-bold text-text-primary">{cohort.month}</td>
              <td className="py-2 pr-4 tabular-nums">{cohort.subscriptions}</td>
              <td className="py-2 pr-4 tabular-nums text-success">{cohort.retained}</td>
              <td className="py-2 pr-4 tabular-nums text-danger">{cohort.canceled}</td>
              <td className="py-2 font-medium tabular-nums">{pct(cohort.retainedPct)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

const EconomicsCard: React.FC<{ economics: BillingInsights['economics'] }> = ({ economics }) => (
  <Card title="Economia unitária" hint="Base de assinaturas ativas (ACTIVE + PAST_DUE)">
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      <Tile label="MRR" value={brl(economics.mrr)} />
      <Tile label="Assinantes" value={String(economics.activeSubs)} />
      <Tile label="ARPA" value={brl(economics.arpa)} />
      <Tile
        label="Churn 30d"
        value={pct(economics.churnRatePct)}
        tone={economics.churnRatePct > 0 ? 'text-danger' : 'text-success'}
      />
      <Tile
        label="LTV"
        value={economics.ltv !== null ? brl(economics.ltv) : '—'}
        tone={economics.ltv !== null ? 'text-accent' : 'text-text-muted'}
      />
      <Tile label="Cancelados 30d" value={String(economics.canceledIn30d)} />
    </div>
  </Card>
);

const ForecastCard: React.FC<{ forecast: BillingInsights['forecast'] }> = ({ forecast }) => (
  <Card title="Previsão de recebimento" hint="Próximos 30 dias, ponderada pela taxa de cobrança">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Tile label="A vencer (30d)" value={brl(forecast.pendingDue30d)} />
      <Tile label="Valor esperado" value={brl(forecast.expectedValue)} tone="text-accent" />
      <Tile
        label="Confiança"
        value={forecast.confidencePct !== null ? pct(forecast.confidencePct) : '—'}
      />
    </div>
  </Card>
);

const ExportButton: React.FC = () => {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = () => {
    setExporting(true);
    setError(null);
    adminApi
      .exportBillingStatementCsv()
      .then(async (res) => {
        if (!res.ok) throw new Error('Falha no export');
        const blob = new Blob([await res.blob()], { type: 'text/csv;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `faturamento-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        window.URL.revokeObjectURL(url);
      })
      .catch(() => setError('Não foi possível exportar o extrato.'))
      .finally(() => setExporting(false));
  };

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-text-secondary hover:bg-bg disabled:opacity-50"
      >
        <LuDownload size={14} />
        {exporting ? 'Exportando…' : 'Extrato CSV'}
      </button>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
};

/** Análises financeiras: faixas de inadimplência, coortes, ARPA/LTV e previsão. */
export const BillingInsightsSection: React.FC = () => {
  const [insights, setInsights] = useState<BillingInsights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    adminApi
      .getBillingInsights()
      .then((res) => {
        if (!active) return;
        setInsights(res.data);
        setError(null);
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar as análises financeiras.');
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  if (!insights && !error) {
    return (
      <div className="flex justify-center py-16">
        <LuLoader className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  if (error && !insights) {
    return (
      <div className="text-center py-16">
        <LuTriangleAlert className="mx-auto mb-2 text-warning" size={22} />
        <p className="text-sm text-text-secondary">{error}</p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setReloadKey((key) => key + 1);
          }}
          className="mt-2 inline-flex items-center gap-1 text-accent text-sm font-bold hover:underline"
        >
          <LuRefreshCcw size={14} /> Tentar novamente
        </button>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-text-primary">Análises financeiras</h3>
          <p className="text-xs text-text-muted">
            Atualizado em{' '}
            {new Date(insights.generatedAt).toLocaleString('pt-BR', {
              dateStyle: 'short',
              timeStyle: 'short',
              timeZone: 'America/Sao_Paulo',
            })}
          </p>
        </div>
        <ExportButton />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <EconomicsCard economics={insights.economics} />
        <ForecastCard forecast={insights.forecast} />
      </div>

      <AgingCard aging={insights.aging} />
      <CohortsCard cohorts={insights.cohorts} />
    </div>
  );
};

export default BillingInsightsSection;
