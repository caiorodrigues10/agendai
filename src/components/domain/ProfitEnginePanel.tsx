import React, { useState, useEffect, useCallback } from 'react';
import {
  LuDollarSign as DollarSign,
  LuTrendingUp as TrendingUp,
  LuChartColumn as BarChart3,
  LuUsers as Users,
  LuScissors as Scissors,
  LuLoaderCircle as Loader2,
  LuCircleAlert as AlertCircle,
  LuSettings as Settings,
  LuRefreshCw as RefreshCw,
} from 'react-icons/lu';
import { CartesianGrid, XAxis, YAxis, Line, LineChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '../ui/chart';
import {
  profitApi,
  type ProfitSettings,
  type ProfitPeriodData,
  type ProfitTrendPoint,
  type ProfitEntry,
} from '../../infra/profitApi';
import { ApiError } from '../../infra/apiClient';

interface ProfitEnginePanelProps {
  barbershopId: string;
}

const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

const pct = (n: number) => `${n.toFixed(1)}%`;

const getCurrentPeriod = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const chartConfig = {
  revenue: { label: 'Receita', color: 'var(--chart-1)' },
  netProfit: { label: 'Lucro Líquido', color: 'var(--chart-2)' },
  margin: { label: 'Margem %', color: 'var(--chart-3)' },
} satisfies ChartConfig;

const cardClass =
  'rounded-2xl border border-border bg-surface p-4 shadow-[0_18px_44px_-32px_rgba(0,0,0,0.7)]';

const compactCardClass =
  'rounded-2xl border border-border bg-bg p-4 transition-colors hover:border-accent/35 hover:bg-surface-2/60';

const EmptyProfitState: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-2xl border border-dashed border-border bg-bg px-6 py-10 text-center text-sm text-text-secondary">
    {children}
  </div>
);

export const ProfitEnginePanel: React.FC<ProfitEnginePanelProps> = ({ barbershopId }) => {
  const [period, setPeriod] = useState(getCurrentPeriod());
  const [settings, setSettings] = useState<ProfitSettings | null>(null);
  const [periodData, setPeriodData] = useState<ProfitPeriodData | null>(null);
  const [trend, setTrend] = useState<ProfitTrendPoint[]>([]);
  const [byService, setByService] = useState<ProfitEntry[]>([]);
  const [byStaff, setByStaff] = useState<ProfitEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'service' | 'staff' | 'trend'>('overview');
  const [showSettings, setShowSettings] = useState(false);
  const [taxRate, setTaxRate] = useState('');
  const [commission, setCommission] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [s, p, t, svc, stf] = await Promise.all([
        profitApi.getSettings(barbershopId),
        profitApi.getPeriodProfit(barbershopId, period),
        profitApi.getTrend(barbershopId, 6),
        profitApi.getByService(barbershopId, period),
        profitApi.getByStaff(barbershopId, period),
      ]);
      setSettings(s);
      setPeriodData(p);
      setTrend(t);
      setByService(svc);
      setByStaff(stf);
      setTaxRate(String(s.defaultTaxRate));
      setCommission(String(s.defaultCommission));
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Erro ao carregar dados';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [barbershopId, period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCompute = async () => {
    try {
      setComputing(true);
      setError(null);
      await profitApi.computePeriod(barbershopId, period);
      await loadData();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Erro ao computar lucro';
      setError(msg);
    } finally {
      setComputing(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await profitApi.updateSettings(barbershopId, {
        defaultTaxRate: parseFloat(taxRate) || 0,
        defaultCommission: parseFloat(commission) || 0,
      });
      setShowSettings(false);
      await loadData();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Erro ao salvar configurações';
      setError(msg);
    }
  };

  if (loading && !periodData) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-border bg-surface p-12">
        <Loader2 size={24} className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-border bg-surface shadow-[0_22px_60px_-40px_rgba(0,0,0,0.9)]">
        <div className="flex flex-col gap-4 border-b border-border bg-gradient-to-r from-accent/10 via-transparent to-transparent p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/25 bg-accent/12 text-accent">
              <DollarSign size={24} className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-text-primary">Motor de Lucro</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Receita, custos, impostos e margem calculados para o período.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="min-h-11 rounded-xl border border-border bg-bg px-3 text-sm font-semibold text-text-primary outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-bg px-3 text-text-secondary transition hover:bg-surface-2 hover:text-text-primary"
              aria-label="Configurações do motor de lucro"
            >
              <Settings size={24} className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleCompute}
              disabled={computing}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-bold text-accent-fg shadow-lg shadow-accent/15 transition hover:bg-accent-hover disabled:opacity-50"
            >
              {computing ? <Loader2 size={24} className="h-4 w-4 animate-spin" /> : <RefreshCw size={24} className="h-4 w-4" />}
              Computar
            </button>
          </div>
        </div>

      {showSettings && (
          <div className="m-5 rounded-2xl border border-border bg-bg p-4">
          <h3 className="font-bold text-text-primary">Configurações de Lucro</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
                <label className="text-xs font-bold uppercase tracking-wide text-text-secondary">Taxa de Imposto (%)</label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                  className="mt-1 min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-accent"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <div>
                <label className="text-xs font-bold uppercase tracking-wide text-text-secondary">Comissão Padrão (%)</label>
              <input
                type="number"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                  className="mt-1 min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-accent"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="min-h-11 rounded-xl border border-border px-4 text-sm font-bold text-text-secondary transition hover:bg-surface-2 hover:text-text-primary"
              >
                Cancelar
              </button>
              <button
                type="button"
              onClick={handleSaveSettings}
                className="min-h-11 rounded-xl bg-accent px-4 text-sm font-bold text-accent-fg transition hover:bg-accent-hover"
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      {error && (
          <div className="mx-5 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          <AlertCircle size={24} className="h-4 w-4" />
          {error}
        </div>
      )}

        <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Receita Total', value: brl(periodData?.totals.revenue ?? 0), tone: 'text-text-primary' },
            { label: 'Lucro Líquido', value: brl(periodData?.totals.netProfit ?? 0), tone: 'text-success' },
            { label: 'Margem', value: pct(periodData?.totals.marginPercent ?? 0), tone: 'text-text-primary' },
            { label: 'Impostos', value: brl(periodData?.totals.taxAmount ?? 0), tone: 'text-warning' },
          ].map(item => (
            <div key={item.label} className="rounded-2xl border border-border bg-bg p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">{item.label}</div>
              <div className={`mt-2 text-2xl font-extrabold ${item.tone}`}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-surface p-2 lg:grid-cols-4">
        {(['overview', 'service', 'staff', 'trend'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`inline-flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-bold transition-colors ${
              activeTab === tab
                ? 'bg-accent text-accent-fg shadow-md shadow-accent/15'
                : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
            }`}
          >
            {tab === 'overview' && 'Resumo'}
            {tab === 'service' && <span className="flex items-center gap-1"><Scissors size={24} className="h-3 w-3" /> Por Serviço</span>}
            {tab === 'staff' && <span className="flex items-center gap-1"><Users size={24} className="h-3 w-3" /> Por Profissional</span>}
            {tab === 'trend' && <span className="flex items-center gap-1"><BarChart3 size={24} className="h-3 w-3" /> Tendência</span>}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && periodData && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className={cardClass}>
            <h3 className="mb-3 font-bold text-text-primary">Composição do Lucro</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-text-secondary"><span>Receita</span><span className="font-bold text-text-primary">{brl(periodData.totals.revenue)}</span></div>
              <div className="flex justify-between text-text-secondary"><span>Custos Indiretos</span><span className="font-bold text-danger">-{brl(periodData.totals.overheadCosts)}</span></div>
              <div className="flex justify-between text-text-secondary"><span>Impostos</span><span className="font-bold text-danger">-{brl(periodData.totals.taxAmount)}</span></div>
              <div className="flex justify-between text-text-secondary"><span>Comissões</span><span className="font-bold text-danger">-{brl(periodData.totals.commissionAmt)}</span></div>
              <div className="flex justify-between border-t border-border pt-3 font-bold text-text-primary">
                <span>Lucro Líquido</span>
                <span className={periodData.totals.netProfit >= 0 ? 'text-success' : 'text-danger'}>
                  {brl(periodData.totals.netProfit)}
                </span>
              </div>
            </div>
          </div>
          <div className={cardClass}>
            <h3 className="mb-3 font-bold text-text-primary">Indicadores</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-text-secondary"><span>Margem Bruta</span><span className="font-bold text-text-primary">{pct(periodData.totals.marginPercent)}</span></div>
              <div className="flex justify-between text-text-secondary"><span>Taxa de Imposto</span><span className="font-bold text-text-primary">{settings ? `${settings.defaultTaxRate}%` : '-'}</span></div>
              <div className="flex justify-between text-text-secondary"><span>Comissão Padrão</span><span className="font-bold text-text-primary">{settings ? `${settings.defaultCommission}%` : '-'}</span></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'service' && (
        <div className={cardClass}>
          <h3 className="mb-3 font-bold text-text-primary">Rentabilidade por Serviço</h3>
          {byService.length === 0 ? (
            <EmptyProfitState>Nenhum dado disponível. Clique em “Computar” para gerar.</EmptyProfitState>
          ) : (
            <div className="space-y-2">
              {byService.map((entry) => (
                <div key={entry.id} className={compactCardClass}>
                  <div className="flex items-center justify-between gap-3">
                  <div>
                      <div className="font-bold text-text-primary">{entry.service?.name ?? 'Serviço'}</div>
                      <div className="text-sm text-text-secondary">Margem: {pct(entry.marginPercent)}</div>
                  </div>
                  <div className="text-right">
                      <div className="font-bold text-text-primary">{brl(Number(entry.revenue))}</div>
                      <div className={`text-sm font-semibold ${Number(entry.netProfit) >= 0 ? 'text-success' : 'text-danger'}`}>
                      Lucro: {brl(Number(entry.netProfit))}
                    </div>
                  </div>
                </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'staff' && (
        <div className={cardClass}>
          <h3 className="mb-3 font-bold text-text-primary">Rentabilidade por Profissional</h3>
          {byStaff.length === 0 ? (
            <EmptyProfitState>Nenhum dado disponível. Clique em “Computar” para gerar.</EmptyProfitState>
          ) : (
            <div className="space-y-2">
              {byStaff.map((entry) => (
                <div key={entry.id} className={compactCardClass}>
                  <div className="flex items-center justify-between gap-3">
                  <div>
                      <div className="font-bold text-text-primary">{entry.staff?.name ?? 'Profissional'}</div>
                      <div className="text-sm text-text-secondary">Margem: {pct(entry.marginPercent)} · Comissão: {brl(Number(entry.commissionAmt))}</div>
                  </div>
                  <div className="text-right">
                      <div className="font-bold text-text-primary">{brl(Number(entry.revenue))}</div>
                      <div className={`text-sm font-semibold ${Number(entry.netProfit) >= 0 ? 'text-success' : 'text-danger'}`}>
                      Lucro: {brl(Number(entry.netProfit))}
                    </div>
                  </div>
                </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'trend' && (
        <div className={cardClass}>
          <h3 className="mb-3 font-bold text-text-primary">Tendência de Lucro (6 meses)</h3>
          {trend.length === 0 ? (
            <EmptyProfitState>Nenhum dado de tendência disponível.</EmptyProfitState>
          ) : (
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="revenue" stroke="var(--chart-1)" name="Receita" />
                <Line type="monotone" dataKey="netProfit" stroke="var(--chart-2)" name="Lucro Líquido" />
              </LineChart>
            </ChartContainer>
          )}
        </div>
      )}
    </div>
  );
};
