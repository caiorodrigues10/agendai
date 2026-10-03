import React from 'react';
import { Link } from 'react-router-dom';
import {
  LuCreditCard, LuBuilding2, LuScissors, LuUsers, LuActivity, LuChartPie,
  LuCircleCheck, LuCircleX, LuCircleAlert, LuClock, LuChevronRight, LuShield,
} from 'react-icons/lu';
import {
  AdminOverview,
  OverviewAttentionItem,
} from '../../infra/adminInternalApi';
import { StatCard } from '../../components/patterns/StatCard';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '../../components/ui/chart';
import {
  BarChart as RechartsBarChart,
  Bar,
  AreaChart as RechartsAreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';

export const brl = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const int = (value: number) => value.toLocaleString('pt-BR');

const pctLabel = (value: number | null) =>
  value === null
    ? null
    : `${value > 0 ? '+' : ''}${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;

export const deltaOf = (
  value: number | null,
): { label: string; direction: 'up' | 'down' | 'neutral' } | undefined => {
  const label = pctLabel(value);
  if (label === null) return undefined;
  return { label, direction: value > 0 ? 'up' : value < 0 ? 'down' : 'neutral' };
};

export const bucketLabel = (key: string, bucket: 'hour' | 'day' | 'month'): string => {
  if (bucket === 'hour') return key.slice(11, 16);
  const [, month, day] = key.split('-');
  if (bucket === 'month') return `${month}/${key.slice(2, 4)}`;
  return `${day}/${month}`;
};

const SEVERITY_STYLES: Record<OverviewAttentionItem['severity'], string> = {
  danger: 'bg-danger/10 text-danger',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-accent/10 text-accent',
};

export const Section: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, subtitle, action, children }) => (
  <div className="bg-surface border border-border rounded-xl p-4">
    <div className="flex items-start justify-between gap-3 mb-3">
      <div>
        <h2 className="text-sm font-bold">{title}</h2>
        {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

export interface ChartRow {
  date: string;
  label: string;
  revenue: number;
  mrr: number;
  newShops: number;
  created: number;
  completed: number;
}

const revenueConfig: ChartConfig = { revenue: { label: 'Receita', color: 'var(--chart-1)' } };
const mrrConfig: ChartConfig = { mrr: { label: 'MRR', color: 'var(--chart-3)' } };
const shopsConfig: ChartConfig = { newShops: { label: 'Novos salões', color: 'var(--chart-2)' } };
const appointmentsConfig: ChartConfig = {
  created: { label: 'Agendados', color: 'var(--chart-1)' },
  completed: { label: 'Concluídos', color: 'var(--chart-2)' },
};

const axisProps = {
  tickLine: false,
  axisLine: false,
  tickMargin: 8,
  interval: 'preserveStartEnd' as const,
  minTickGap: 24,
  className: 'text-[10px]',
};

const EmptyChart: React.FC = () => (
  <p className="text-sm text-text-muted py-6 text-center">Sem dados no período.</p>
);

export const OverviewKpis: React.FC<{ data: AdminOverview }> = ({ data }) => {
  const { revenue, subscriptions, growth, usage } = data;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Receita no período"
          value={brl(revenue.periodRevenue)}
          icon={<LuCreditCard size={16} />}
          delta={deltaOf(revenue.periodRevenueDeltaPct)}
          hint={`${int(revenue.paidInvoices)} cobranças pagas`}
        />
        <StatCard
          label="MRR"
          value={brl(revenue.mrr)}
          icon={<LuCreditCard size={16} />}
          hint={`ARR ${brl(revenue.arr)} · ARPA ${brl(revenue.arpa)}`}
        />
        <StatCard
          label="Salões ativos"
          value={int(growth.activeShops)}
          icon={<LuBuilding2 size={16} />}
          delta={deltaOf(growth.newShopsDeltaPct)}
          hint={`${int(growth.newShops)} novos · ${int(growth.pendingApprovals)} pendentes`}
        />
        <StatCard
          label="Assinaturas ativas"
          value={int(subscriptions.active)}
          icon={<LuCreditCard size={16} />}
          hint={`${int(subscriptions.trialing)} em trial · ${int(subscriptions.pastDue)} em atraso`}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Atendimentos concluídos"
          value={int(usage.completedAppointments)}
          icon={<LuScissors size={16} />}
          hint={`${int(usage.appointmentsCreated)} agendados`}
        />
        <StatCard
          label="GMV dos salões"
          value={brl(usage.gmv)}
          icon={<LuUsers size={16} />}
          hint={`${int(usage.newClients)} novos clientes`}
        />
        <StatCard
          label="Novos salões"
          value={int(growth.newShops)}
          icon={<LuBuilding2 size={16} />}
          delta={deltaOf(growth.newShopsDeltaPct)}
          hint={`Churn ${int(growth.churnShops)} · ${brl(growth.churnRevenue)} de MRR perdido`}
        />
        <StatCard
          label="Mensagens WhatsApp"
          value={int(usage.whatsappSent)}
          icon={<LuActivity size={16} />}
          hint={`${int(usage.whatsappDelivered)} entregues · ${int(usage.emailSent)} e-mails`}
        />
      </div>
    </>
  );
};

export const OverviewCharts: React.FC<{ rows: ChartRow[] }> = ({ rows }) => {
  if (rows.length === 0) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <Section key={item} title="Sem dados">
            <EmptyChart />
          </Section>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Section title="Receita" subtitle="Cobranças pagas por dia no período">
        <ChartContainer config={revenueConfig} className="aspect-auto h-48 w-full">
          <RechartsBarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis tickLine={false} axisLine={false} width={48} className="text-[10px]" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </RechartsBarChart>
        </ChartContainer>
      </Section>

      <Section title="MRR" subtitle="Receita recorrente estimada no período">
        <ChartContainer config={mrrConfig} className="aspect-auto h-48 w-full">
          <RechartsAreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="mrrFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-mrr)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-mrr)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis tickLine={false} axisLine={false} width={48} className="text-[10px]" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="mrr"
              stroke="var(--color-mrr)"
              fill="url(#mrrFill)"
              strokeWidth={2}
              dot={false}
            />
          </RechartsAreaChart>
        </ChartContainer>
      </Section>

      <Section title="Novos salões" subtitle="Cadastros criados no período">
        <ChartContainer config={shopsConfig} className="aspect-auto h-48 w-full">
          <RechartsBarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis tickLine={false} axisLine={false} width={36} allowDecimals={false} className="text-[10px]" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="newShops" fill="var(--color-newShops)" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </RechartsBarChart>
        </ChartContainer>
      </Section>

      <Section title="Atendimentos" subtitle="Agendados e concluídos no período">
        <ChartContainer config={appointmentsConfig} className="aspect-auto h-48 w-full">
          <RechartsBarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis tickLine={false} axisLine={false} width={36} allowDecimals={false} className="text-[10px]" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="created" fill="var(--color-created)" radius={[4, 4, 0, 0]} maxBarSize={18} />
            <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} maxBarSize={18} />
          </RechartsBarChart>
        </ChartContainer>
      </Section>
    </div>
  );
};

export const OverviewPlans: React.FC<{ data: AdminOverview }> = ({ data }) => (
  <Section title="Planos" subtitle="Assinaturas ativas e receita por plano no período">
    <div className="divide-y divide-border/50">
      {data.revenue.byPlan.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-muted">Nenhum plano cadastrado.</p>
      ) : (
        data.revenue.byPlan.map((plan) => (
          <div key={plan.planId} className="flex items-center gap-3 py-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{plan.name}</p>
              <p className="text-xs text-text-muted">
                {brl(plan.price)}
                {plan.billingCycle === 'YEARLY' ? '/ano' : '/mês'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold">{brl(plan.periodRevenue)}</p>
              <p className="text-xs text-text-muted">
                {int(plan.activeSubscriptions)} ativos · {int(plan.periodInvoices)} cobranças
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  </Section>
);

export const OverviewGrowth: React.FC<{ data: AdminOverview }> = ({ data }) => {
  const { growth, charts } = data;
  const steps = [
    { label: 'Salões criados', value: charts.funnel.shopsCreated },
    { label: 'Onboarding concluído', value: charts.funnel.onboardingCompleted },
    { label: 'Primeiro atendimento', value: charts.funnel.shopsWithAppointment },
    { label: 'Assinatura paga', value: charts.funnel.paidSubscriptions },
  ];

  return (
    <Section title="Crescimento" subtitle="Funil do período e conversão de trial">
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center shrink-0">
              {index + 1}
            </span>
            <span className="flex-1 text-sm text-text-secondary">{step.label}</span>
            <span className="text-sm font-bold">{int(step.value)}</span>
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
          <div className="rounded-lg bg-bg border border-border p-3">
            <p className="text-xs text-text-muted">Trial → pago</p>
            <p className="text-lg font-bold">
              {growth.trialToPaidPct === null ? '—' : `${growth.trialToPaidPct}%`}
            </p>
            <p className="text-xs text-text-muted">
              {int(growth.trialPaid)} de {int(growth.trialStarted)}
            </p>
          </div>
          <div className="rounded-lg bg-bg border border-border p-3">
            <p className="text-xs text-text-muted">MRR perdido (churn)</p>
            <p className="text-lg font-bold">{brl(growth.churnRevenue)}</p>
            <p className="text-xs text-text-muted">{int(growth.churnShops)} cancelamentos</p>
          </div>
        </div>
      </div>
    </Section>
  );
};

type HealthStatus = 'ok' | 'warning' | 'danger' | 'neutral';

const healthStatusIcon = (status: HealthStatus): React.ReactNode => {
  if (status === 'ok') return <LuCircleCheck size={14} className="text-success" />;
  if (status === 'warning') return <LuCircleAlert size={14} className="text-warning" />;
  if (status === 'danger') return <LuCircleX size={14} className="text-danger" />;
  return <LuClock size={14} className="text-text-muted" />;
};

export const OverviewHealth: React.FC<{ data: AdminOverview }> = ({ data }) => {
  const { health, usage, subscriptions } = data;
  const failedDeliveries = health.whatsappFailed24h + health.emailFailed24h;
  const lateSubscriptions = subscriptions.pastDue + subscriptions.unpaid;

  const metrics: { label: string; value: string; status: HealthStatus; extra: string }[] = [
    {
      label: 'Erros 5xx (24h)',
      value: int(health.errors5xx24h),
      status: health.errors5xx24h > 0 ? 'danger' : 'ok',
      extra: `${int(health.errors5xxLastHour)} na última hora`,
    },
    {
      label: 'Crons com falha',
      value: int(health.cronFailures24h),
      status: health.cronFailures24h > 0 ? 'danger' : 'ok',
      extra: 'rotinas agendadas',
    },
    {
      label: 'Fila de notificações',
      value: int(health.outboxStuck),
      status: health.outboxStuck > 0 ? 'warning' : 'ok',
      extra: 'presas ou atrasadas',
    },
    {
      label: 'Entregas com falha',
      value: int(failedDeliveries),
      status: failedDeliveries > 0 ? 'warning' : 'ok',
      extra: 'WhatsApp + e-mail',
    },
    {
      label: 'Latência de envio',
      value: `${int(Math.round(health.avgDeliveryLatencyMs))} ms`,
      status: 'neutral',
      extra: 'fila → enviado',
    },
    {
      label: 'Avaliações',
      value:
        usage.avgRating === null
          ? '—'
          : usage.avgRating.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
      status: 'neutral',
      extra: `${int(usage.reviews)} no período`,
    },
    {
      label: 'Assinaturas em atraso',
      value: int(lateSubscriptions),
      status: lateSubscriptions > 0 ? 'warning' : 'ok',
      extra: 'precisam de cobrança',
    },
    {
      label: 'Trials expirando (7d)',
      value: int(subscriptions.trialingExpiring7d),
      status: subscriptions.trialingExpiring7d > 0 ? 'warning' : 'ok',
      extra: 'abordagem comercial',
    },
  ];

  return (
    <Section
      title="Saúde da operação"
      subtitle="Últimas 24 horas"
      action={
        <Link to="/master/operations" className="text-xs text-accent hover:underline">
          Ver operação
        </Link>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((item) => (
          <div key={item.label} className="rounded-lg bg-bg border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-text-muted">{item.label}</p>
              {healthStatusIcon(item.status)}
            </div>
            <p className="mt-1 text-lg font-bold">{item.value}</p>
            <p className="text-[11px] text-text-muted">{item.extra}</p>
          </div>
        ))}
      </div>
    </Section>
  );
};

export const OverviewAttention: React.FC<{ attention: OverviewAttentionItem[] }> = ({
  attention,
}) => (
  <Section
    title="Requer atenção"
    subtitle="Itens que precisam de ação"
    action={
      <Link to="/master/tickets" className="text-xs text-accent hover:underline">
        Atendimento
      </Link>
    }
  >
    {attention.length === 0 ? (
      <div className="flex items-center gap-2 py-4 text-sm text-success">
        <LuCircleCheck size={16} /> Nada pendente no momento.
      </div>
    ) : (
      <div className="divide-y divide-border/50">
        {attention.map((item) => (
          <Link
            key={item.id}
            to={item.to}
            className="flex items-center gap-3 py-3 hover:bg-hover-bg transition-colors rounded-lg px-2 -mx-2 focus:outline-none focus:ring-2 focus:ring-focus"
          >
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${SEVERITY_STYLES[item.severity]}`}
            >
              {item.count}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.title}</p>
              <p className="text-xs text-text-muted truncate">{item.description}</p>
            </div>
            <LuChevronRight size={14} className="text-text-muted shrink-0" />
          </Link>
        ))}
      </div>
    )}
  </Section>
);

export const OverviewFooter: React.FC = () => (
  <p className="text-xs text-text-muted flex items-center gap-1">
    <LuShield size={12} /> Agregados da plataforma · dados sensíveis exibidos apenas em totais
  </p>
);

export const EmptyPeriodNotice: React.FC = () => (
  <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary">
    <LuChartPie size={16} className="text-text-muted" />
    Nenhum movimento registrado no período selecionado.
  </div>
);
