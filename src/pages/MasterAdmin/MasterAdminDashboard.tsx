import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  CreditCard,
  PieChart,
  LogOut,
  Search,
  Clock,
  TrendingUp,
  TrendingDown,
  Scissors,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCcw,
  BarChart3,
  ChevronRight,
  UserPlus,
  MoreVertical,
  ShieldCheck,
  UserCog,
  History,
  Trash2,
  Ban,
  Mail,
  Shield,
  Gift,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '../../components/ui/chart';
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Area,
  AreaChart as RechartsAreaChart,
  XAxis,
  YAxis,
} from 'recharts';
import {
  adminApi,
  DashboardPeriod,
  DashboardData,
  BarbershopListItem,
  UserListItem,
  AuditLog,
} from '../../infra/adminApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { BillingTab } from './BillingTab';
import { ReferralsTab } from './ReferralsTab';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Tab = 'overview' | 'barbershops' | 'users' | 'billing' | 'referrals';

const PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: 'day', label: '1D' },
  { value: 'week', label: '7D' },
  { value: '1m', label: '1M' },
  { value: '3m', label: '3M' },
  { value: '6m', label: '6M' },
  { value: '12m', label: '12M' },
  { value: '1y', label: '1A' },
  { value: '2y', label: '2A' },
  { value: '3y', label: '3A' },
  { value: '5y', label: '5A' },
];

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

interface KPICardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: string;
  trendUp?: boolean;
  color: 'cyan' | 'green' | 'red' | 'purple' | 'blue';
  delay?: number;
}

const COLOR_MAP = {
  cyan: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    text: 'text-violet-400',
    glow: 'bg-violet-500/5 group-hover:bg-violet-500/10',
  },
  green: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    text: 'text-green-400',
    glow: 'bg-green-500/5 group-hover:bg-green-500/10',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-400',
    glow: 'bg-red-500/5 group-hover:bg-red-500/10',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    text: 'text-purple-400',
    glow: 'bg-purple-500/5 group-hover:bg-purple-500/10',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    glow: 'bg-blue-500/5 group-hover:bg-blue-500/10',
  },
};

const KPICard: React.FC<KPICardProps> = ({
  icon,
  value,
  label,
  trend,
  trendUp,
  color,
  delay = 0,
}) => {
  const c = COLOR_MAP[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-surface border border-border p-6 rounded-2xl relative overflow-hidden group hover:border-border-strong transition-all duration-300"
    >
      <div
        className={`absolute top-0 right-0 w-32 h-32 ${c.glow} rounded-full blur-2xl -mr-10 -mt-10 transition-colors duration-500`}
      />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div
          className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center ${c.text} border ${c.border}`}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 ${
              trendUp ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
            }`}
          >
            {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {trend}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <h3 className="text-4xl font-black text-text-primary tracking-tighter mb-1">{value}</h3>
        <p className="text-xs text-text-muted uppercase tracking-widest font-semibold">{label}</p>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────
// Bar Chart (Tailwind native, Landing-Page style)
// ─────────────────────────────────────────────

interface MetricBarChartProps {
  data: { label: string; newShops: number; appointments: number; completedQueue: number }[];
  metric: 'newShops' | 'appointments' | 'completedQueue';
}

const METRIC_CHART_CONFIG: ChartConfig = {
  newShops: { label: 'Novos Salões', color: 'var(--chart-2)' },
  appointments: { label: 'Agendamentos', color: 'var(--chart-1)' },
  completedQueue: { label: 'Atendimentos Fila', color: 'var(--chart-3)' },
};

const MetricBarChart: React.FC<MetricBarChartProps> = ({ data, metric }) => {
  const config: ChartConfig = {
    [metric]: METRIC_CHART_CONFIG[metric],
  };

  return (
    <ChartContainer config={config} className="aspect-auto h-48 w-full">
      <RechartsBarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval="preserveStartEnd"
          minTickGap={24}
          className="text-[10px]"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={36}
          allowDecimals={false}
          className="text-[10px]"
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey={metric}
          fill={`var(--color-${metric})`}
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
      </RechartsBarChart>
    </ChartContainer>
  );
};

interface TrendAreaChartProps {
  data: { label: string; value: number }[];
}

const trendChartConfig: ChartConfig = {
  value: { label: 'Tendência', color: 'var(--chart-3)' },
};

const TrendAreaChart: React.FC<TrendAreaChartProps> = ({ data }) => {
  if (data.length < 2) return null;

  return (
    <ChartContainer config={trendChartConfig} className="aspect-auto h-24 w-full">
      <RechartsAreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" hide />
        <YAxis hide domain={['dataMin', 'dataMax']} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--color-value)"
          fill="url(#trendFill)"
          strokeWidth={2}
          dot={false}
        />
      </RechartsAreaChart>
    </ChartContainer>
  );
};

// ─────────────────────────────────────────────
// Period selector
// ─────────────────────────────────────────────
interface PeriodSelectorProps {
  selected: DashboardPeriod;
  onChange: (p: DashboardPeriod) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ selected, onChange }) => (
  <div className="flex items-center gap-1 bg-bg border border-border rounded-xl p-1">
    {PERIOD_OPTIONS.map(opt => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${
          selected === opt.value
            ? 'bg-violet-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
            : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

// ─────────────────────────────────────────────
// Approval Badge
// ─────────────────────────────────────────────
const ApprovalBadge: React.FC<{ status: 'PENDING' | 'APPROVED' | 'REJECTED' }> = ({ status }) => {
  const cfg = {
    PENDING: {
      label: 'Pendente',
      colorClass: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    },
    APPROVED: {
      label: 'Aprovada',
      colorClass: 'bg-green-500/10 text-green-400 border-green-500/20',
    },
    REJECTED: { label: 'Rejeitada', colorClass: 'bg-red-500/10 text-red-400 border-red-500/20' },
  }[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${cfg.colorClass}`}
    >
      {status === 'PENDING' ? (
        <AlertCircle size={9} />
      ) : status === 'APPROVED' ? (
        <CheckCircle2 size={9} />
      ) : (
        <XCircle size={9} />
      )}
      {cfg.label}
    </span>
  );
};

// ─────────────────────────────────────────────
// Overview Tab
// ─────────────────────────────────────────────
const OverviewTab: React.FC<{
  data: DashboardData | null;
  loading: boolean;
  period: DashboardPeriod;
  onPeriodChange: (p: DashboardPeriod) => void;
  chartMetric: 'newShops' | 'appointments' | 'completedQueue';
  onMetricChange: (m: 'newShops' | 'appointments' | 'completedQueue') => void;
}> = ({ data, loading, period, onPeriodChange, chartMetric, onMetricChange }) => {
  const METRIC_OPTIONS = [
    { value: 'newShops' as const, label: 'Salões' },
    { value: 'appointments' as const, label: 'Agendamentos' },
    { value: 'completedQueue' as const, label: 'Fila Concluída' },
  ];

  const lineData = data?.chartData.map(d => ({ label: d.label, value: d[chartMetric] })) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">
            Painel de Controle
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            {data ? `Métricas: ${data.periodLabel}` : 'Carregando dados...'}
          </p>
        </div>
        <PeriodSelector selected={period} onChange={onPeriodChange} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          icon={<Building2 size={18} />}
          value={loading ? '—' : (data?.kpis.totalBarbershops.toLocaleString('pt-BR') ?? '—')}
          label="Total de Salões"
          trend={data?.kpis.growthRate}
          trendUp={data ? !data.kpis.growthRate.startsWith('-') : true}
          color="cyan"
          delay={0}
        />
        <KPICard
          icon={<CheckCircle2 size={18} />}
          value={loading ? '—' : (data?.kpis.activeBarbershops.toLocaleString('pt-BR') ?? '—')}
          label="Salões Ativos"
          color="green"
          delay={0.08}
        />
        <KPICard
          icon={<Users size={18} />}
          value={loading ? '—' : (data?.kpis.totalUsers.toLocaleString('pt-BR') ?? '—')}
          label="Usuários (Staff)"
          color="blue"
          delay={0.16}
        />
        <KPICard
          icon={<TrendingUp size={18} />}
          value={loading ? '—' : (data?.kpis.newInPeriod.toLocaleString('pt-BR') ?? '—')}
          label={`Novas no Período`}
          trend={data?.kpis.growthRate}
          trendUp={data ? !data.kpis.growthRate.startsWith('-') : true}
          color="purple"
          delay={0.24}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 hover:border-border-strong transition-colors"
        >
          {/* Chart header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <BarChart3 size={18} className="text-violet-400" />
              <span className="font-bold text-text-primary text tracking-tight">
                Evolução do Período
              </span>
            </div>
            <div className="flex items-center gap-1 bg-bg border border-border rounded-lg p-0.5">
              {METRIC_OPTIONS.map(m => (
                <button
                  key={m.value}
                  onClick={() => onMetricChange(m.value)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                    chartMetric === m.value
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center h-48">
              <RefreshCcw size={20} className="text-text-muted animate-spin" />
            </div>
          ) : (
            <MetricBarChart data={data?.chartData ?? []} metric={chartMetric} />
          )}
        </motion.div>

        {/* Line chart mini + recents */}
        <div className="flex flex-col gap-5">
          {/* Line chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-surface border border-border rounded-2xl p-5 hover:border-border-strong transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-text-primary">Tendência</span>
              <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">
                {data?.periodLabel}
              </span>
            </div>
            <div className="h-24 relative">
              {!loading && lineData.length >= 2 ? (
                <TrendAreaChart data={lineData} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <RefreshCcw size={16} className="text-text-muted animate-spin" />
                </div>
              )}
            </div>
            {data && (
              <div className="mt-2 flex items-center gap-2">
                <div
                  className={`flex items-center gap-1 text-xs font-bold ${
                    !data.kpis.growthRate.startsWith('-') ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {!data.kpis.growthRate.startsWith('-') ? (
                    <TrendingUp size={12} />
                  ) : (
                    <TrendingDown size={12} />
                  )}
                  {data.kpis.growthRate}
                </div>
                <span className="text-[10px] text-text-muted">vs período anterior</span>
              </div>
            )}
          </motion.div>

          {/* Recentes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-surface border border-border rounded-2xl p-5 flex-1 flex flex-col hover:border-border-strong transition-colors overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-text-primary">Recém Cadastradas</span>
              <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">
                Ao vivo
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-14 bg-surface-2/50 rounded-xl animate-pulse" />
                  ))
                : data?.recentBarbershops.map(shop => (
                    <div
                      key={shop.id}
                      className="bg-surface-2/40 hover:bg-surface-2 p-3 rounded-xl border border-border transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-text-primary group-hover:text-violet-400 transition-colors truncate">
                            {shop.name}
                          </div>
                          <div className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                            <Users size={9} />
                            {shop._count.users} membros
                          </div>
                        </div>
                        <ApprovalBadge status={shop.approvalStatus} />
                      </div>
                    </div>
                  ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Manage Barbershop Modal
// ─────────────────────────────────────────────

interface ManageBarbershopModalProps {
  shop: BarbershopListItem;
  onClose: () => void;
  onUpdated: () => void;
}

const ManageBarbershopModal: React.FC<ManageBarbershopModalProps> = ({
  shop,
  onClose,
  onUpdated,
}) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (body: {
    active?: boolean;
    approvalStatus?: string;
    rejectionReason?: string;
  }) => {
    setSaving(true);
    setError(null);
    try {
      await adminApi.updateBarbershopStatus(shop.id, body);
      onUpdated();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao atualizar o salão. Tente novamente.'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = () => {
    const target = !shop.active;
    if (!confirm(`Deseja realmente ${target ? 'ativar' : 'desativar'} o salão "${shop.name}"?`))
      return;
    mutate({ active: target });
  };

  const handleApprove = () => mutate({ approvalStatus: 'APPROVED' });

  const handleReject = () => {
    const reason = prompt('Motivo da rejeição (opcional):') ?? undefined;
    mutate({ approvalStatus: 'REJECTED', ...(reason ? { rejectionReason: reason } : {}) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-text-primary tracking-tight">{shop.name}</h3>
            <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">
              Gerenciar salão
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-2.5 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Detalhes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-bg/40 border border-border rounded-xl p-3.5">
              <p className="text-[9px] text-text-muted uppercase tracking-widest font-bold mb-1">
                CNPJ
              </p>
              <p className="text-sm text-text-primary font-medium truncate">{shop.cnpj ?? '—'}</p>
            </div>
            <div className="bg-bg/40 border border-border rounded-xl p-3.5">
              <p className="text-[9px] text-text-muted uppercase tracking-widest font-bold mb-1">
                WhatsApp
              </p>
              <p className="text-sm text-text-primary font-medium truncate">
                {shop.whatsapp || '—'}
              </p>
            </div>
            <div className="bg-bg/40 border border-border rounded-xl p-3.5 col-span-2">
              <p className="text-[9px] text-text-muted uppercase tracking-widest font-bold mb-1">
                Endereço
              </p>
              <p className="text-sm text-text-primary font-medium">{shop.address ?? '—'}</p>
            </div>
            <div className="bg-bg/40 border border-border rounded-xl p-3.5">
              <p className="text-[9px] text-text-muted uppercase tracking-widest font-bold mb-1">
                Cadastrado em
              </p>
              <p className="text-sm text-text-primary font-medium">
                {new Date(shop.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="bg-bg/40 border border-border rounded-xl p-3.5">
              <p className="text-[9px] text-text-muted uppercase tracking-widest font-bold mb-1">
                Aprovação
              </p>
              <ApprovalBadge status={shop.approvalStatus} />
            </div>
          </div>

          {/* Contadores */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-bg/40 border border-border rounded-xl p-3.5 text-center">
              <p className="text-lg font-black text-text-primary">{shop._count.users}</p>
              <p className="text-[9px] text-text-muted uppercase tracking-widest font-bold">
                Membros
              </p>
            </div>
            <div className="bg-bg/40 border border-border rounded-xl p-3.5 text-center">
              <p className="text-lg font-black text-text-primary">{shop._count.appointments}</p>
              <p className="text-[9px] text-text-muted uppercase tracking-widest font-bold">
                Agendam.
              </p>
            </div>
            <div className="bg-bg/40 border border-border rounded-xl p-3.5 text-center">
              <p className="text-lg font-black text-text-primary">{shop._count.queue}</p>
              <p className="text-[9px] text-text-muted uppercase tracking-widest font-bold">Fila</p>
            </div>
          </div>

          {/* Ações de aprovação (apenas quando pendente) */}
          {shop.approvalStatus === 'PENDING' && (
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
              >
                <CheckCircle2 size={16} />
                Aprovar
              </button>
              <button
                onClick={handleReject}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
              >
                <XCircle size={16} />
                Rejeitar
              </button>
            </div>
          )}

          {/* Ativar / Desativar */}
          <button
            onClick={handleToggleActive}
            disabled={saving}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all disabled:opacity-50 ${
              shop.active
                ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
            }`}
          >
            {saving ? (
              <RefreshCcw size={16} className="animate-spin" />
            ) : shop.active ? (
              <Ban size={16} />
            ) : (
              <CheckCircle2 size={16} />
            )}
            {saving ? 'Salvando...' : shop.active ? 'Desativar salão' : 'Ativar salão'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Barbershops Tab
// ─────────────────────────────────────────────
const BarbershopsTab: React.FC = () => {
  const [shops, setShops] = useState<BarbershopListItem[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [managedShop, setManagedShop] = useState<BarbershopListItem | null>(null);

  const fetchShops = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.listBarbershops({
        page,
        limit: 10,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search || undefined,
      });
      setShops(res.data);
      setMeta(res.meta);
    } catch (err) {
      // noop
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchShops, 300);
    return () => clearTimeout(timer);
  }, [fetchShops]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Gestão de Salões</h2>
          <p className="text-text-secondary text-sm mt-1">
            {meta.total} sal{meta.total !== 1 ? 'ões' : 'ão'} encontrado
            {meta.total !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nome, CNPJ ou endereço..."
            className="w-full bg-surface border border-border text-text-primary text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-text-muted"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl p-1">
          {(['all', 'active', 'inactive'] as const).map(s => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                statusFilter === s
                  ? 'bg-violet-500 text-black'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
              }`}
            >
              {s === 'all' ? 'Todas' : s === 'active' ? 'Ativas' : 'Inativas'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-bg text-text-muted uppercase text-[10px] font-bold tracking-widest border-b border-border">
            <tr>
              <th className="px-6 py-3.5">Nome</th>
              <th className="px-6 py-3.5 hidden md:table-cell">Endereço</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 hidden lg:table-cell">Membros</th>
              <th className="px-6 py-3.5 hidden lg:table-cell">Aprovação</th>
              <th className="px-6 py-3.5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-surface-2 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : shops.map(shop => (
                  <tr key={shop.id} className="hover:bg-surface-2/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-text-primary text-sm">{shop.name}</div>
                      {shop.cnpj && <div className="text-xs text-text-muted">{shop.cnpj}</div>}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="text-xs text-text-secondary max-w-[160px] truncate">
                        {shop.address ?? '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                          shop.active
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-surface-2 text-text-muted border-border-strong'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${shop.active ? 'bg-success' : 'bg-text-muted'}`}
                        />
                        {shop.active ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="text-text-secondary text-sm font-medium">
                        {shop._count.users}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <ApprovalBadge status={shop.approvalStatus} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setManagedShop(shop)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-violet-500 hover:text-violet-400 transition-colors"
                      >
                        Gerenciar <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-3 border-t border-border flex items-center justify-between bg-bg/40">
          <span className="text-xs text-text-muted font-medium">
            {loading
              ? '...'
              : `Exibindo ${(page - 1) * meta.limit + 1}–${Math.min(page * meta.limit, meta.total)} de ${meta.total}`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-xs text-text-muted font-mono">
              {page}/{meta.totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
              className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>

      {managedShop && (
        <ManageBarbershopModal
          shop={managedShop}
          onClose={() => setManagedShop(null)}
          onUpdated={fetchShops}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Users Tab
// ─────────────────────────────────────────────

interface EditUserModalProps {
  user: UserListItem | null;
  barbershops: BarbershopListItem[];
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  loading: boolean;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  barbershops,
  onClose,
  onSave,
  loading,
}) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'CUSTOMER',
    active: user?.active ?? true,
    barbershopId: user?.barbershopId || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.barbershopId && formData.role !== 'MASTER_ADMIN') {
      alert('Por favor, selecione um salão para este usuário.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="text-xl font-bold text-text-primary tracking-tight">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-bg border border-border text-text-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-all"
              placeholder="Ex: João Silva"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
              E-mail
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-bg border border-border text-text-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-all"
              placeholder="email@exemplo.com"
            />
          </div>
          {!user && (
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
                Senha Provisória
              </label>
              <input
                type="password"
                required={!user}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-bg border border-border text-text-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-all"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
                Cargo / Role
              </label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full bg-bg border border-border text-text-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-all appearance-none cursor-pointer"
              >
                <option value="MASTER_ADMIN">Master Admin</option>
                <option value="OWNER">Proprietário</option>
                <option value="EMPLOYEE">Funcionário</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
                Status
              </label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, active: !formData.active })}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                  formData.active
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                }`}
              >
                {formData.active ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                {formData.active ? 'Ativo' : 'Suspenso'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
              Vincular Salão
            </label>
            <select
              required={formData.role !== 'MASTER_ADMIN'}
              value={formData.barbershopId || ''}
              onChange={e => setFormData({ ...formData, barbershopId: e.target.value })}
              className="w-full bg-bg border border-border text-text-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-all appearance-none cursor-pointer"
            >
              <option value="">Selecione um salão...</option>
              <option
                value="NULL"
                className={formData.role === 'MASTER_ADMIN' ? 'block' : 'hidden'}
              >
                Sem Salão (Apenas Master)
              </option>
              {barbershops.map(shop => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-text-muted mt-1 ml-1">
              * Obrigatório para proprietários e funcionários
            </p>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded-xl text-sm font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-violet-500 text-black rounded-xl text-sm font-bold hover:bg-violet-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

interface AuditLogDrawerProps {
  user: UserListItem;
  onClose: () => void;
}

const AuditLogDrawer: React.FC<AuditLogDrawerProps> = ({ user, onClose }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await adminApi.listAuditLogs({ userId: user.id, limit: 50 });
        setLogs(res.data);
      } catch (err) {
        // noop
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [user.id]);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface border-l border-border shadow-2xl flex flex-col">
      <div className="p-6 border-b border-border flex justify-between items-center bg-bg/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/20">
            <History size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary tracking-tight leading-none">
              Logs de Auditoria
            </h3>
            <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1.5">
              {user.name}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          <XCircle size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-surface-2/40 rounded-2xl animate-pulse" />
          ))
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-muted">
            <ShieldCheck size={40} className="mb-2 opacity-20" />
            <p className="text-sm font-medium">Nenhuma atividade registrada.</p>
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="relative pl-6 border-l border-border pb-2 last:pb-0">
              <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-violet-500 ring-4 ring-surface" />
              <div className="bg-bg/40 border border-border/50 rounded-xl p-3.5 group hover:border-border-strong transition-colors">
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <span className="text-[10px] font-black text-violet-400 uppercase tracking-tighter">
                    {log.action}
                  </span>
                  <span className="text-[9px] text-text-muted font-medium">
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                <p className="text-xs text-text-secondary line-clamp-2">
                  {log.details ? log.details : `Ação no recurso ${log.resource}`}
                </p>
                {log.ipAddress && (
                  <div className="mt-2 text-[8px] text-text-muted font-mono">
                    IP: {log.ipAddress}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [barbershops, setBarbershops] = useState<BarbershopListItem[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [logUser, setLogUser] = useState<UserListItem | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, shopsRes] = await Promise.all([
        adminApi.listUsers({
          page,
          limit: 10,
          role: roleFilter === 'all' ? undefined : roleFilter,
          search: search || undefined,
        }),
        adminApi.listBarbershops({ limit: 100 }),
      ]);
      setUsers(userRes.data);
      setMeta(userRes.meta);
      setBarbershops(shopsRes.data);
    } catch (err) {
      // noop
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleSaveUser = async (data: any) => {
    setSaving(true);
    try {
      if (selectedUser) {
        await adminApi.updateUser(selectedUser.id, data);
      } else {
        await adminApi.createUser(data);
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert('Erro ao salvar usuário');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user: UserListItem) => {
    if (!confirm(`Deseja realmente excluir ${user.name}? Esta ação é irreversível.`)) return;
    try {
      await adminApi.deleteUser(user.id);
      fetchUsers();
    } catch (err) {
      alert('Erro ao excluir usuário');
    }
  };

  return (
    <div className="space-y-5 relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">
            Gestão de Usuários
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Controle de acesso e monitoramento de atividades
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedUser(null);
            setModalOpen(true);
          }}
          className="bg-violet-500 hover:bg-violet-400 text-black px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95"
        >
          <UserPlus size={18} />
          Adicionar Usuário
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full bg-surface border border-border text-text-primary text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-text-muted"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl p-1 overflow-x-auto scroller-hidden">
          {['all', 'MASTER_ADMIN', 'OWNER', 'EMPLOYEE'].map(r => (
            <button
              key={r}
              onClick={() => {
                setRoleFilter(r);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                roleFilter === r
                  ? 'bg-violet-500 text-black'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
              }`}
            >
              {r === 'all' ? 'Todos' : r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg text-text-muted uppercase text-[10px] font-bold tracking-widest border-b border-border">
              <tr>
                <th className="px-6 py-3.5">Usuário</th>
                <th className="px-6 py-3.5">Role / Cargo</th>
                <th className="px-6 py-3.5 hidden md:table-cell">Salão</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-5">
                      <div className="h-10 bg-surface-2/50 rounded-xl animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-text-muted font-medium">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="group hover:bg-surface-2/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${
                            u.role === 'MASTER_ADMIN'
                              ? 'bg-violet-500 text-black'
                              : 'bg-surface-2 text-text-secondary'
                          }`}
                        >
                          {(u.name?.[0] ?? 'U').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-text-primary text-sm truncate">
                            {u.name}
                          </div>
                          <div className="text-[10px] text-text-muted font-mono truncate">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                          u.role === 'MASTER_ADMIN'
                            ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                            : u.role === 'OWNER'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                              : u.role === 'EMPLOYEE'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                : 'bg-surface-2 text-text-muted border-border-strong'
                        }`}
                      >
                        <Shield size={9} />
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="text-xs text-text-secondary font-medium italic">
                        {u.barbershop?.name ?? 'Plataforma Master'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                          u.active
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full ${u.active ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}
                        />
                        {u.active ? 'Ativo' : 'Suspenso'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center bg-bg/80 border border-border rounded-xl p-1 gap-1 shadow-sm">
                        <button
                          onClick={() => setLogUser(u)}
                          title="Ver Atividades"
                          className="p-2 text-text-muted hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all"
                        >
                          <History size={16} />
                        </button>
                        <div className="w-px h-4 bg-surface-2 mx-0.5" />
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setModalOpen(true);
                          }}
                          title="Editar"
                          className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-2 rounded-lg transition-all"
                        >
                          <UserCog size={16} />
                        </button>
                        <div className="w-px h-4 bg-surface-2 mx-0.5" />
                        <button
                          onClick={() => handleDeleteUser(u)}
                          title="Excluir"
                          className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-border flex items-center justify-between bg-bg/40">
          <span className="text-xs text-text-muted font-medium">
            Total: <span className="text-text-secondary">{meta.total}</span> usuários
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-xs text-text-muted font-mono tracking-tighter">
              {page} de {meta.totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
              className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <EditUserModal
          user={selectedUser}
          barbershops={barbershops}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveUser}
          loading={saving}
        />
      )}

      {logUser && <AuditLogDrawer user={logUser} onClose={() => setLogUser(null)} />}
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────
export const MasterAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [period, setPeriod] = useState<DashboardPeriod>('12m');
  const [chartMetric, setChartMetric] = useState<'newShops' | 'appointments' | 'completedQueue'>(
    'newShops'
  );
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDashboard(period);
      setDashboardData(res.data);
    } catch {
      // noop - user might not have backend running
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    if (activeTab === 'overview') fetchDashboard();
  }, [fetchDashboard, activeTab]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NAV_ITEMS: { tab: Tab; icon: React.ReactNode; label: string }[] = [
    { tab: 'overview', icon: <PieChart size={17} />, label: 'Visão Geral' },
    { tab: 'barbershops', icon: <Scissors size={17} />, label: 'Salões' },
    { tab: 'users', icon: <Users size={17} />, label: 'Usuários' },
    { tab: 'billing', icon: <CreditCard size={17} />, label: 'Faturamento' },
    { tab: 'referrals', icon: <Gift size={17} />, label: 'Indicações' },
  ];

  return (
    <div className="min-h-screen bg-bg text-text-primary flex overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-60 bg-bg border-r border-border/70 hidden md:flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-5 border-b border-border/70 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-violet-500 to-blue-600 flex items-center justify-center font-black text-white text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            M
          </div>
          <div>
            <p className="font-bold text-text-primary text-xs tracking-tight leading-none">
              Master Admin
            </p>
            <p className="text-[10px] text-violet-400/70 uppercase tracking-widest mt-0.5">
              AGENDAI Master
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ tab, icon, label }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                activeTab === tab
                  ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-[inset_0_0_10px_rgba(6,182,212,0.05)]'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-2/60'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-border/70 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-7 h-7 rounded-full bg-linear-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white font-black text-xs shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-text-primary truncate">
                {user?.name ?? 'Admin'}
              </p>
              <p className="text-[10px] text-text-muted truncate">{user?.email ?? ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-sm font-medium"
          >
            <LogOut size={17} />
            Sair
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-14 border-b border-border/60 bg-bg/60 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile: show current tab */}
            <span className="text-sm font-bold text-text-primary capitalize md:hidden">
              {NAV_ITEMS.find(n => n.tab === activeTab)?.label}
            </span>
            <span className="hidden md:flex items-center gap-2 text-xs text-text-muted">
              <span className="text-text-muted">/</span>
              {NAV_ITEMS.find(n => n.tab === activeTab)?.label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {activeTab === 'overview' && (
              <button
                onClick={fetchDashboard}
                disabled={loading}
                title="Atualizar"
                className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-2 rounded-lg transition-all"
              >
                <RefreshCcw size={14} className={loading ? 'animate-spin text-violet-400' : ''} />
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-7">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <OverviewTab
                  data={dashboardData}
                  loading={loading}
                  period={period}
                  onPeriodChange={setPeriod}
                  chartMetric={chartMetric}
                  onMetricChange={setChartMetric}
                />
              </motion.div>
            )}
            {activeTab === 'barbershops' && (
              <motion.div
                key="barbershops"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <BarbershopsTab />
              </motion.div>
            )}
            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <UsersTab />
              </motion.div>
            )}
            {activeTab === 'billing' && (
              <motion.div
                key="billing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <BillingTab />
              </motion.div>
            )}
            {activeTab === 'referrals' && (
              <motion.div
                key="referrals"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ReferralsTab />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default MasterAdminDashboard;
