import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  Scissors,
  Loader2,
  AlertCircle,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from 'recharts';
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
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Motor de Lucro</h2>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 border rounded hover:bg-muted"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={handleCompute}
            disabled={computing}
            className="flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {computing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Computar
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="border rounded p-4 space-y-3 bg-muted/50">
          <h3 className="font-medium">Configurações de Lucro</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Taxa de Imposto (%)</label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm mt-1"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Comissão Padrão (%)</label>
              <input
                type="number"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm mt-1"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveSettings}
              className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
            >
              Salvar
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className="px-3 py-1 border rounded text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-4 gap-3">
        <div className="border rounded p-3">
          <div className="text-sm text-muted-foreground">Receita Total</div>
          <div className="text-xl font-bold">{brl(periodData?.totals.revenue ?? 0)}</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-sm text-muted-foreground">Lucro Líquido</div>
          <div className="text-xl font-bold text-green-600">{brl(periodData?.totals.netProfit ?? 0)}</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-sm text-muted-foreground">Margem</div>
          <div className="text-xl font-bold">{pct(periodData?.totals.marginPercent ?? 0)}</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-sm text-muted-foreground">Impostos</div>
          <div className="text-xl font-bold text-orange-600">{brl(periodData?.totals.taxAmount ?? 0)}</div>
        </div>
      </div>

      <div className="flex gap-1 border-b">
        {(['overview', 'service', 'staff', 'trend'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'overview' && 'Resumo'}
            {tab === 'service' && <span className="flex items-center gap-1"><Scissors className="h-3 w-3" /> Por Serviço</span>}
            {tab === 'staff' && <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Por Profissional</span>}
            {tab === 'trend' && <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" /> Tendência</span>}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && periodData && (
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded p-4">
            <h3 className="font-medium mb-3">Composição do Lucro</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Receita</span><span>{brl(periodData.totals.revenue)}</span></div>
              <div className="flex justify-between"><span>Custos Indiretos</span><span className="text-red-600">-{brl(periodData.totals.overheadCosts)}</span></div>
              <div className="flex justify-between"><span>Impostos</span><span className="text-red-600">-{brl(periodData.totals.taxAmount)}</span></div>
              <div className="flex justify-between"><span>Comissões</span><span className="text-red-600">-{brl(periodData.totals.commissionAmt)}</span></div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Lucro Líquido</span>
                <span className={periodData.totals.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {brl(periodData.totals.netProfit)}
                </span>
              </div>
            </div>
          </div>
          <div className="border rounded p-4">
            <h3 className="font-medium mb-3">Indicadores</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Margem Bruta</span><span>{pct(periodData.totals.marginPercent)}</span></div>
              <div className="flex justify-between"><span>Taxa de Imposto</span><span>{settings ? `${settings.defaultTaxRate}%` : '-'}</span></div>
              <div className="flex justify-between"><span>Comissão Padrão</span><span>{settings ? `${settings.defaultCommission}%` : '-'}</span></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'service' && (
        <div className="border rounded p-4">
          <h3 className="font-medium mb-3">Rentabilidade por Serviço</h3>
          {byService.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum dado disponível. Clique em "Computar" para gerar.</p>
          ) : (
            <div className="space-y-2">
              {byService.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{entry.service?.name ?? 'Serviço'}</div>
                    <div className="text-sm text-muted-foreground">Margem: {pct(entry.marginPercent)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{brl(Number(entry.revenue))}</div>
                    <div className={`text-sm ${Number(entry.netProfit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Lucro: {brl(Number(entry.netProfit))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="border rounded p-4">
          <h3 className="font-medium mb-3">Rentabilidade por Profissional</h3>
          {byStaff.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum dado disponível. Clique em "Computar" para gerar.</p>
          ) : (
            <div className="space-y-2">
              {byStaff.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{entry.staff?.name ?? 'Profissional'}</div>
                    <div className="text-sm text-muted-foreground">Margem: {pct(entry.marginPercent)} | Comissão: {brl(Number(entry.commissionAmt))}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{brl(Number(entry.revenue))}</div>
                    <div className={`text-sm ${Number(entry.netProfit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Lucro: {brl(Number(entry.netProfit))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'trend' && (
        <div className="border rounded p-4">
          <h3 className="font-medium mb-3">Tendência de Lucro (6 meses)</h3>
          {trend.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum dado de tendência disponível.</p>
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
