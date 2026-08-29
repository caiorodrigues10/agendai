import React, { useState, useMemo, useEffect } from 'react';
import { QueueItem, Service, StaffMember } from '../../types';
import {
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  Filter,
  History,
  Trash2,
  Check,
  X,
  Clock,
  Sparkles,
  Loader2,
  AlertCircle,
  UserMinus,
  Scissors,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '../ui/chart';
import {
  financialApi,
  type BarbershopInsights,
  type InsightsPeriod,
} from '../../infra/financialApi';
import { ApiError } from '../../infra/apiClient';

interface FinancialDashboardProps {
  queueHistory: QueueItem[];
  services: Service[];
  currentUser: StaffMember;
  allStaff: StaffMember[];
  onDeleteHistoryItem: (id: string) => void;
}

const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

const isOwnerLike = (role: StaffMember['role']) =>
  role === 'OWNER' ||
  role === 'MASTER_ADMIN' ||
  (role as string) === 'owner' ||
  (role as string) === 'admin';

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  queueHistory,
  services,
  currentUser,
  allStaff,
  onDeleteHistoryItem,
}) => {
  const owner = isOwnerLike(currentUser.role);
  const [viewMode, setViewMode] = useState<'personal' | 'shop'>(owner ? 'shop' : 'personal');
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [period, setPeriod] = useState<InsightsPeriod>('30d');
  const [insights, setInsights] = useState<BarbershopInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  useEffect(() => {
    if (!owner || viewMode !== 'shop') return;
    let cancelled = false;
    setInsightsLoading(true);
    setInsightsError(null);
    financialApi
      .getInsights(period)
      .then(data => {
        if (!cancelled) setInsights(data);
      })
      .catch(err => {
        if (cancelled) return;
        if (err instanceof ApiError && err.code === 'DASHBOARD_REQUIRED') {
          setInsightsError('Insights disponíveis no plano Pro.');
        } else {
          setInsightsError(
            err instanceof Error ? err.message : 'Não foi possível carregar insights.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setInsightsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [owner, viewMode, period]);

  const getStaffName = (id?: string) => allStaff.find(s => s.id === id)?.name || 'Desconhecido';
  const getServiceName = (id: string) =>
    services.find(s => s.id === id)?.name || 'Serviço Removido';

  const filteredData = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return queueHistory
      .filter(item => {
        if (item.status !== 'completed' || !item.completedAt) return false;
        if (viewMode === 'personal' && item.completedBy !== currentUser.id) return false;
        if (timeFilter === 'today' && item.completedAt < startOfDay) return false;
        if (timeFilter === 'week' && item.completedAt < startOfWeek) return false;
        if (timeFilter === 'month' && item.completedAt < startOfMonth) return false;
        return true;
      })
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  }, [queueHistory, viewMode, timeFilter, currentUser.id]);

  const localStats = useMemo(() => {
    const totalRevenue = filteredData.reduce((acc, curr) => acc + (curr.finalPrice || 0), 0);
    const totalClients = filteredData.length;
    const avgTicket = totalClients > 0 ? totalRevenue / totalClients : 0;
    const daysCount = [0, 0, 0, 0, 0, 0, 0];
    filteredData.forEach(item => {
      if (item.completedAt) {
        daysCount[new Date(item.completedAt).getDay()]++;
      }
    });
    return { totalRevenue, totalClients, avgTicket, daysCount };
  }, [filteredData]);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const weeklyChartData =
    insights && viewMode === 'shop'
      ? insights.byWeekday.map(d => ({ day: d.label, volume: d.volume, revenue: d.revenue }))
      : weekDays.map((day, index) => ({
          day,
          volume: localStats.daysCount[index],
          revenue: 0,
        }));

  const weeklyChartConfig: ChartConfig = {
    volume: { label: 'Atendimentos', color: 'var(--chart-1)' },
    revenue: { label: 'Receita', color: 'var(--chart-2)' },
  };
  const hourConfig: ChartConfig = {
    volume: { label: 'Atendimentos', color: 'var(--chart-3)' },
  };
  const serviceConfig: ChartConfig = {
    revenue: { label: 'Receita', color: 'var(--chart-1)' },
  };
  const staffConfig: ChartConfig = {
    revenue: { label: 'Receita', color: 'var(--chart-2)' },
  };

  const kpis = insights?.kpis;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 bg-surface p-4 rounded-xl border border-border">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <TrendingUp className="text-accent" /> Relatórios
          </h2>

          {owner && (
            <div className="flex bg-bg rounded-lg p-1 border border-border">
              <button
                onClick={() => setViewMode('shop')}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${
                  viewMode === 'shop' ? 'bg-surface-2 text-text-primary shadow' : 'text-text-muted'
                }`}
              >
                Salão
              </button>
              <button
                onClick={() => setViewMode('personal')}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${
                  viewMode === 'personal' ? 'bg-accent/15 text-accent shadow' : 'text-text-muted'
                }`}
              >
                Meus Resultados
              </button>
            </div>
          )}
        </div>

        {viewMode === 'shop' && owner ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(
              [
                { id: '7d' as const, label: '7 dias' },
                { id: '30d' as const, label: '30 dias' },
                { id: '90d' as const, label: '90 dias' },
              ] as const
            ).map(t => (
              <button
                key={t.id}
                onClick={() => setPeriod(t.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${
                  period === t.id
                    ? 'bg-accent border-accent text-accent-fg'
                    : 'bg-bg border-border text-text-muted hover:border-border-strong'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['today', 'week', 'month', 'all'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${
                  timeFilter === t
                    ? 'bg-accent border-accent text-accent-fg'
                    : 'bg-bg border-border text-text-muted hover:border-border-strong'
                }`}
              >
                {t === 'today' ? 'Hoje' : t === 'week' ? 'Semana' : t === 'month' ? 'Mês' : 'Tudo'}
              </button>
            ))}
          </div>
        )}
      </div>

      {owner && viewMode === 'shop' && (
        <>
          {insightsLoading && (
            <div className="flex items-center justify-center py-12 text-accent">
              <Loader2 className="animate-spin" size={28} />
            </div>
          )}

          {insightsError && (
            <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-sm text-danger flex items-center gap-2">
              <AlertCircle size={16} /> {insightsError}
            </div>
          )}

          {!insightsLoading && insights && (
            <>
              <div className="bg-surface p-5 rounded-xl border border-border">
                <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-accent" /> Insights do período
                </h3>
                <ul className="space-y-2">
                  {insights.highlights.map((h, i) => (
                    <li key={i} className="text-sm text-text-secondary leading-relaxed flex gap-2">
                      <span className="text-accent font-bold shrink-0">·</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    label: 'Faturamento',
                    value: brl(kpis!.revenue),
                    icon: DollarSign,
                    tone: 'text-success',
                  },
                  {
                    label: 'Lucro líquido',
                    value: brl(kpis!.netProfit),
                    icon: TrendingUp,
                    tone: kpis!.netProfit >= 0 ? 'text-success' : 'text-danger',
                  },
                  {
                    label: 'Ticket médio',
                    value: brl(kpis!.avgTicket),
                    icon: Filter,
                    tone: 'text-accent',
                  },
                  {
                    label: 'Atendimentos',
                    value: String(kpis!.completedServices),
                    icon: Users,
                    tone: 'text-text-primary',
                  },
                  {
                    label: 'Espera média',
                    value:
                      kpis!.avgWaitMinutes != null
                        ? `${Math.round(kpis!.avgWaitMinutes)} min`
                        : '—',
                    icon: Clock,
                    tone: 'text-text-primary',
                  },
                  {
                    label: 'Clientes únicos',
                    value: String(kpis!.uniqueCustomers),
                    icon: Users,
                    tone: 'text-text-primary',
                  },
                  {
                    label: 'Retorno',
                    value: `${kpis!.returningCustomerRate}%`,
                    icon: TrendingUp,
                    tone: 'text-accent',
                  },
                  {
                    label: 'Cancel. agenda',
                    value: `${kpis!.appointmentCancelRate}%`,
                    icon: AlertCircle,
                    tone: kpis!.appointmentCancelRate >= 15 ? 'text-warning' : 'text-text-primary',
                  },
                ].map(card => (
                  <div
                    key={card.label}
                    className="bg-surface p-3 rounded-xl border border-border shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute -right-2 -top-2 text-border opacity-20">
                      <card.icon size={56} />
                    </div>
                    <p className="text-[10px] text-text-muted uppercase font-bold mb-1">
                      {card.label}
                    </p>
                    <h3 className={`text-lg font-bold truncate ${card.tone}`}>{card.value}</h3>
                  </div>
                ))}
              </div>

              {(kpis!.openFiado > 0 || kpis!.expenses > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="bg-surface border border-border rounded-xl px-4 py-3">
                    <p className="text-[10px] uppercase text-text-muted font-bold">Despesas</p>
                    <p className="font-bold text-text-primary">{brl(kpis!.expenses)}</p>
                  </div>
                  <div className="bg-surface border border-border rounded-xl px-4 py-3">
                    <p className="text-[10px] uppercase text-text-muted font-bold">Fiado aberto</p>
                    <p className="font-bold text-text-primary">{brl(kpis!.openFiado)}</p>
                  </div>
                  <div className="bg-surface border border-border rounded-xl px-4 py-3">
                    <p className="text-[10px] uppercase text-text-muted font-bold">Fiado vencido</p>
                    <p className="font-bold text-warning">{brl(kpis!.overdueFiado)}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-surface p-5 rounded-xl border border-border">
                  <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                    <Calendar size={16} className="text-accent" /> Volume por dia
                  </h3>
                  <ChartContainer config={weeklyChartConfig} className="aspect-auto h-44 w-full">
                    <BarChart
                      data={weeklyChartData}
                      margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="day"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        className="text-[10px]"
                      />
                      <YAxis hide allowDecimals={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="volume"
                        fill="var(--color-volume)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={32}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>

                <div className="bg-surface p-5 rounded-xl border border-border">
                  <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                    <Clock size={16} className="text-accent" /> Pico por horário
                  </h3>
                  <ChartContainer config={hourConfig} className="aspect-auto h-44 w-full">
                    <BarChart
                      data={insights.byHour}
                      margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        interval={1}
                        className="text-[9px]"
                      />
                      <YAxis hide allowDecimals={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="volume"
                        fill="var(--color-volume)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={20}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>

                {insights.topServices.length > 0 && (
                  <div className="bg-surface p-5 rounded-xl border border-border">
                    <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                      <Scissors size={16} className="text-accent" /> Top serviços
                    </h3>
                    <ChartContainer config={serviceConfig} className="aspect-auto h-48 w-full">
                      <BarChart
                        data={insights.topServices}
                        layout="vertical"
                        margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                      >
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                        <XAxis type="number" hide />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={90}
                          tickLine={false}
                          axisLine={false}
                          className="text-[10px]"
                        />
                        <ChartTooltip
                          content={<ChartTooltipContent formatter={v => brl(Number(v))} />}
                        />
                        <Bar
                          dataKey="revenue"
                          fill="var(--color-revenue)"
                          radius={[0, 4, 4, 0]}
                          maxBarSize={16}
                        />
                      </BarChart>
                    </ChartContainer>
                  </div>
                )}

                {insights.byStaff.length > 0 && (
                  <div className="bg-surface p-5 rounded-xl border border-border">
                    <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                      <Users size={16} className="text-accent" /> Por profissional
                    </h3>
                    <ChartContainer config={staffConfig} className="aspect-auto h-48 w-full">
                      <BarChart
                        data={insights.byStaff}
                        layout="vertical"
                        margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                      >
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                        <XAxis type="number" hide />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={90}
                          tickLine={false}
                          axisLine={false}
                          className="text-[10px]"
                        />
                        <ChartTooltip
                          content={<ChartTooltipContent formatter={v => brl(Number(v))} />}
                        />
                        <Bar
                          dataKey="revenue"
                          fill="var(--color-revenue)"
                          radius={[0, 4, 4, 0]}
                          maxBarSize={16}
                        />
                      </BarChart>
                    </ChartContainer>
                  </div>
                )}
              </div>

              {insights.inactiveCustomers.length > 0 && (
                <div className="bg-surface rounded-xl border border-border overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center gap-2">
                    <UserMinus size={16} className="text-warning" />
                    <h3 className="text-sm font-bold text-text-primary">
                      Clientes inativos (30+ dias sem visita)
                    </h3>
                  </div>
                  <div className="max-h-56 overflow-y-auto divide-y divide-border">
                    {insights.inactiveCustomers.map(c => (
                      <div
                        key={c.whatsapp}
                        className="px-4 py-3 flex items-center justify-between gap-3 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-text-primary truncate">{c.customerName}</p>
                          <p className="text-xs text-text-muted">{c.whatsapp}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-warning">{c.daysSince} dias</p>
                          <p className="text-[10px] text-text-muted">{c.visits} visita(s)</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {viewMode === 'personal' && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface p-3 rounded-xl border border-border shadow-lg relative overflow-hidden">
              <div className="absolute -right-2 -top-2 text-border opacity-20">
                <DollarSign size={64} />
              </div>
              <p className="text-xs text-text-muted uppercase font-bold mb-1">Faturamento</p>
              <h3 className="text-lg sm:text-xl font-bold text-success truncate">
                R$ {localStats.totalRevenue.toFixed(0)}
              </h3>
            </div>
            <div className="bg-surface p-3 rounded-xl border border-border shadow-lg relative overflow-hidden">
              <div className="absolute -right-2 -top-2 text-border opacity-20">
                <Users size={64} />
              </div>
              <p className="text-xs text-text-muted uppercase font-bold mb-1">Clientes</p>
              <h3 className="text-lg sm:text-xl font-bold text-text-primary">
                {localStats.totalClients}
              </h3>
            </div>
            <div className="bg-surface p-3 rounded-xl border border-border shadow-lg relative overflow-hidden">
              <div className="absolute -right-2 -top-2 text-border opacity-20">
                <Filter size={64} />
              </div>
              <p className="text-xs text-text-muted uppercase font-bold mb-1">Ticket Médio</p>
              <h3 className="text-lg sm:text-xl font-bold text-accent">
                R$ {localStats.avgTicket.toFixed(0)}
              </h3>
            </div>
          </div>

          <div className="bg-surface p-5 rounded-xl border border-border">
            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-accent" /> Fluxo Semanal (Volume)
            </h3>
            <ChartContainer config={weeklyChartConfig} className="aspect-auto h-36 w-full">
              <BarChart data={weeklyChartData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-[10px]"
                />
                <YAxis hide allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="volume"
                  fill="var(--color-volume)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </>
      )}

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center bg-surface/50">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <History size={16} className="text-accent" /> Histórico de Atendimentos
          </h3>
          <span className="text-xs text-text-muted">{filteredData.length} registros</span>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {filteredData.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-sm">
              Nenhum registro encontrado para este período.
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="min-w-[860px] w-full text-left border-collapse">
              <thead className="bg-bg text-text-muted text-[10px] uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="p-3 font-medium">Data/Hora</th>
                  <th className="p-3 font-medium">Cliente</th>
                  <th className="p-3 font-medium">Serviço</th>
                  {viewMode === 'shop' && (
                    <th className="p-3 font-medium text-right">Profissional</th>
                  )}
                  <th className="p-3 font-medium text-right">Valor</th>
                  {owner && <th className="p-3 font-medium text-center">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredData.map(item => (
                  <tr key={item.id} className="text-xs text-text-secondary hover:bg-surface">
                    <td className="p-3 whitespace-nowrap">
                      {new Date(item.completedAt || 0).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-3">{item.customerName}</td>
                    <td className="p-3">{getServiceName(item.serviceId)}</td>
                    {viewMode === 'shop' && (
                      <td className="p-3 text-right">{getStaffName(item.completedBy)}</td>
                    )}
                    <td className="p-3 text-right text-success">
                      R$ {(item.finalPrice || 0).toFixed(2)}
                    </td>
                    {owner && (
                      <td className="p-3 text-center">
                        {deleteConfirmId === item.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                onDeleteHistoryItem(item.id);
                                setDeleteConfirmId(null);
                              }}
                              className="p-1 bg-danger text-accent-fg rounded"
                            >
                              <Check size={12} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="p-1 bg-surface-2 text-text-secondary rounded"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="text-text-muted hover:text-danger"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
