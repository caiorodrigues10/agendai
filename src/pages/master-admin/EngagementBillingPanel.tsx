import React from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '../../components/ui/chart';
import type { EngagementBilling, EngagementBillingFilter, EngagementBillingShop } from '../../infra/adminEngagementApi';

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const integer = (value: number) => value.toLocaleString('pt-BR');
const date = (value: string | null) => value
  ? new Date(value).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  : '—';
const month = (value: string) => `${value.slice(5, 7)}/${value.slice(2, 4)}`;

const revenueConfig: ChartConfig = { amount: { label: 'Recebido', color: 'var(--chart-1)' } };
const shopsConfig: ChartConfig = { shops: { label: 'Salões que pagaram', color: 'var(--chart-3)' } };

const filters: { key: EngagementBillingFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'paying', label: 'Pagando' },
  { key: 'late', label: 'Em atraso' },
  { key: 'trial', label: 'Em teste' },
  { key: 'withoutSubscription', label: 'Sem assinatura' },
];

const statusOf = (shop: EngagementBillingShop): { label: string; tone: string } => {
  switch (shop.subscriptionStatus) {
    case 'ACTIVE':
      return shop.paidInvoices > 0
        ? { label: 'Pagando', tone: 'text-success bg-success/10' }
        : { label: 'Ativa sem pagamento', tone: 'text-warning bg-warning/10' };
    case 'PAST_DUE':
    case 'UNPAID': return { label: 'Em atraso', tone: 'text-danger bg-danger/10' };
    case 'TRIALING': return { label: 'Em teste', tone: 'text-support bg-support/10' };
    case 'PENDING': return { label: 'Aguardando pagamento', tone: 'text-warning bg-warning/10' };
    case 'CANCELED': return { label: 'Cancelada', tone: 'text-text-muted bg-surface-2' };
    default: return { label: 'Sem assinatura', tone: 'text-text-muted bg-surface-2' };
  }
};

const StatusBadge = ({ shop }: { shop: EngagementBillingShop }) => {
  const { label, tone } = statusOf(shop);
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{label}</span>;
};

const Metric = ({ label, value, hint }: { label: string; value: string; hint: string }) => (
  <div className="rounded-xl border border-border bg-surface p-4">
    <p className="text-xs font-semibold text-text-secondary">{label}</p>
    <p className="mt-2 text-2xl font-bold tabular-nums text-text-primary">{value}</p>
    <p className="mt-1 text-xs text-text-muted">{hint}</p>
  </div>
);

interface Props {
  data: EngagementBilling;
  filter: EngagementBillingFilter;
  onFilterChange: (filter: EngagementBillingFilter) => void;
  search: string;
  onSearchChange: (value: string) => void;
  refreshing: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  moreError: boolean;
}

export const EngagementBillingPanel: React.FC<Props> = ({
  data, filter, onFilterChange, search, onSearchChange, refreshing, loadingMore, onLoadMore, moreError,
}) => {
  const { summary, monthly, shops } = data;
  const hasPayments = monthly.some((row) => row.amount > 0);
  return (
    <section className="space-y-4" aria-label="Assinaturas e pagamentos" aria-busy={refreshing}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Assinaturas e pagamentos</h2>
          <p className="text-sm text-text-muted">Quem está pagando, o que entrou e quais salões precisam de atenção.</p>
        </div>
        <p className="text-xs text-text-muted">{integer(summary.registered)} salões cadastrados</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Salões pagando" value={integer(summary.paying)} hint="Assinatura ativa com fatura paga" />
        <Metric label="Recebido em 30 dias" value={money(summary.collected30d)} hint="Faturas confirmadas" />
        <Metric label="Em atraso" value={integer(summary.late)} hint={`${money(summary.overdueAmount)} em cobranças vencidas`} />
        <Metric label="Em teste" value={integer(summary.trial)} hint="Ainda sem cobrança recorrente" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="text-sm font-bold">Recebimentos confirmados</h3>
          <p className="text-xs text-text-muted">Faturas pagas por mês · últimos 12 meses</p>
          {hasPayments ? (
            <ChartContainer config={revenueConfig} className="mt-4 aspect-auto h-56 w-full">
              <AreaChart accessibilityLayer data={monthly} margin={{ left: 0, right: 6 }}>
                <CartesianGrid vertical={false} stroke="var(--ag-border)" />
                <XAxis dataKey="month" tickFormatter={month} tickLine={false} axisLine={false} minTickGap={20} />
                <YAxis tickFormatter={(v: number) => `R$ ${integer(v)}`} tickLine={false} axisLine={false} width={76} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => <span className="font-semibold tabular-nums">{money(Number(value))}</span>} />} />
                <Area dataKey="amount" type="monotone" stroke="var(--color-amount)" fill="var(--color-amount)" fillOpacity={0.16} strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          ) : <p className="flex h-56 items-center justify-center text-sm text-text-muted">Nenhum pagamento confirmado nos últimos 12 meses.</p>}
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="text-sm font-bold">Salões que pagaram</h3>
          <p className="text-xs text-text-muted">Salões distintos com pagamento em cada mês</p>
          {hasPayments ? (
            <ChartContainer config={shopsConfig} className="mt-4 aspect-auto h-56 w-full">
              <BarChart accessibilityLayer data={monthly} margin={{ left: 0, right: 6 }}>
                <CartesianGrid vertical={false} stroke="var(--ag-border)" />
                <XAxis dataKey="month" tickFormatter={month} tickLine={false} axisLine={false} minTickGap={20} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="shops" fill="var(--color-shops)" radius={[5, 5, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ChartContainer>
          ) : <p className="flex h-56 items-center justify-center text-sm text-text-muted">Sem salões com pagamento confirmado no período.</p>}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold">Situação dos salões</h3>
            <p className="text-xs text-text-muted">
              {integer(data.matching)} resultados · {summary.pending} aguardando pagamento · {summary.activeWithoutPaidInvoice} ativos sem fatura paga · {summary.withoutSubscription} sem assinatura
            </p>
          </div>
          <label className="w-full sm:w-64">
            <span className="sr-only">Buscar salão</span>
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar salão pelo nome"
              className="h-10 w-full rounded-lg border border-input-border bg-input-bg px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus"
            />
          </label>
        </div>
        <div className="my-4 flex flex-wrap gap-2" role="group" aria-label="Filtrar salões por pagamento">
          {filters.map((option) => (
            <button
              key={option.key}
              type="button"
              aria-pressed={filter === option.key}
              onClick={() => onFilterChange(option.key)}
              className={`min-h-10 rounded-lg border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${filter === option.key ? 'border-accent bg-accent/15 text-accent' : 'border-border text-text-secondary hover:bg-surface-2'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {shops.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-text-muted">Nenhum salão encontrado com este filtro.</p>
        ) : (
          <>
            <div className="space-y-2 md:hidden">
              {shops.map((shop) => (
                <div key={shop.id} className="rounded-lg border border-border bg-bg p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div><p className="font-semibold">{shop.name}</p><p className="text-xs text-text-muted">{shop.planName ?? 'Sem plano'}{!shop.active ? ' · Salão desativado' : ''}</p></div>
                    <StatusBadge shop={shop} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <p><span className="text-text-muted">Meses equivalentes:</span> <strong>{shop.paidMonthsEquivalent}</strong></p>
                    <p><span className="text-text-muted">Faturas pagas:</span> <strong>{shop.paidInvoices}</strong></p>
                    <p><span className="text-text-muted">Total pago:</span> <strong>{money(shop.totalPaid)}</strong></p>
                    <p><span className="text-text-muted">Último pagamento:</span> <strong>{date(shop.lastPaidAt)}</strong></p>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px] text-left text-xs">
                <thead className="border-b border-border text-text-muted">
                  <tr>
                    <th scope="col" className="py-3 pr-3">Salão e plano</th>
                    <th scope="col" className="py-3 pr-3">Situação</th>
                    <th scope="col" className="py-3 pr-3 text-right">Meses equiv.</th>
                    <th scope="col" className="py-3 pr-3 text-right">Faturas pagas</th>
                    <th scope="col" className="py-3 pr-3 text-right">Total pago</th>
                    <th scope="col" className="py-3 text-right">Último pagamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {shops.map((shop) => (
                    <tr key={shop.id}>
                      <td className="py-3 pr-3"><strong className="text-text-primary">{shop.name}</strong><span className="block text-text-muted">{shop.planName ?? 'Sem plano'}{!shop.active ? ' · Desativado' : ''}</span></td>
                      <td className="py-3 pr-3"><StatusBadge shop={shop} /></td>
                      <td className="py-3 pr-3 text-right tabular-nums">{integer(shop.paidMonthsEquivalent)}</td>
                      <td className="py-3 pr-3 text-right tabular-nums">{integer(shop.paidInvoices)}</td>
                      <td className="py-3 pr-3 text-right tabular-nums">{money(shop.totalPaid)}</td>
                      <td className="py-3 text-right tabular-nums">{date(shop.lastPaidAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {data.nextCursor && (
          <div className="mt-4 text-center">
            <button type="button" onClick={onLoadMore} disabled={loadingMore} className="min-h-10 rounded-lg border border-border px-4 text-sm font-semibold text-text-secondary hover:bg-surface-2 disabled:opacity-50">
              {loadingMore ? 'Carregando...' : 'Carregar mais salões'}
            </button>
            {moreError && <p className="mt-2 text-xs text-danger">Não foi possível carregar mais salões. Tente novamente.</p>}
          </div>
        )}
        <p className="mt-4 border-t border-border pt-3 text-xs text-text-muted">
          Meses equivalentes de faturas pagas: mensal = 1, anual = 12. Esse total representa ciclos quitados, não meses já decorridos. Cobranças de serviços ao cliente final não entram aqui.
        </p>
      </div>
    </section>
  );
};
