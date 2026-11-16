import React from 'react';
import { LuInfo, LuRadioTower } from 'react-icons/lu';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import type {
  AdminTrafficData,
  TrafficBucketGranularity,
  TrafficPeriod,
  TrafficUserRole,
} from '../../infra/adminTrafficApi';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '../../components/ui/chart';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  StatCard,
  Tooltip,
  type StatCardProps,
} from '../../components/patterns';
import { formatDatePtBr, formatNumber, ROLE_LABELS, VISITOR_TOOLTIP } from './trafficOverviewUtils';

const trafficChartConfig: ChartConfig = {
  visits: {
    label: 'Visitas',
    theme: { light: 'var(--chart-1)', dark: 'var(--chart-1)' },
  },
  visitors: {
    label: 'Visitantes',
    theme: { light: 'var(--chart-2)', dark: 'var(--chart-2)' },
  },
};

function formatDelta(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
}

function buildDelta(value: number | null | undefined): StatCardProps['delta'] {
  if (value === null || value === undefined) return undefined;

  const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'neutral';
  const arrow = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→';

  return {
    direction,
    label: `${arrow} Δ% ${formatDelta(value)} em relação ao período anterior`,
  };
}

function roleContext(role: TrafficUserRole | undefined): string {
  return role ? `filtro: ${ROLE_LABELS[role]} (${role})` : 'todos os papéis';
}

function partialLabel(granularity: TrafficBucketGranularity): string {
  switch (granularity) {
    case 'hour':
      return 'hora parcial';
    case 'day':
      return 'dia parcial';
    case 'week':
      return 'semana parcial';
    case 'month':
      return 'mês parcial';
    case 'year':
      return 'ano parcial';
  }
}

export const TrafficNotices: React.FC<{ data: AdminTrafficData }> = ({ data }) => {
  const trafficStart = data.period.dataFrom
    ? `contagem de visitas a partir de ${formatDatePtBr(data.period.dataFrom)}`
    : null;
  const activityStart = data.userActivity.firstRecordedAt
    ? `usuários logados a partir de ${formatDatePtBr(data.userActivity.firstRecordedAt)}`
    : null;

  return (
    <div className="space-y-3">
      {!data.beaconEnabled && (
        <div
          role="status"
          className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-text-primary"
        >
          <div className="flex items-start gap-3">
            <LuRadioTower className="mt-0.5 shrink-0 text-accent" size={18} aria-hidden="true" />
            <p>
              A coleta de tráfego está desativada. Por isso, os dados podem estar ausentes; a
              ausência é esperada enquanto a coleta estiver desativada.
            </p>
          </div>
        </div>
      )}

      {(trafficStart || activityStart) && (
        <Card>
          <CardHeader>
            <CardTitle>Avisos de coleta</CardTitle>
          </CardHeader>
          <CardBody className="space-y-1 text-sm text-text-secondary">
            {trafficStart && <p>{trafficStart}</p>}
            {activityStart && <p>{activityStart}</p>}
          </CardBody>
        </Card>
      )}
    </div>
  );
};

const VisitorTooltipLabel: React.FC<{ label: string }> = ({ label }) => (
  <Button
    variant="ghost"
    size="sm"
    className="h-auto min-h-0 rounded-none px-0 py-0 text-xs uppercase tracking-wide text-text-muted hover:bg-transparent hover:text-text-primary"
  >
    {label}
    <LuInfo size={13} aria-hidden="true" />
  </Button>
);

export const TrafficKpis: React.FC<{
  data: AdminTrafficData;
  period: TrafficPeriod;
  selectedRole: TrafficUserRole | undefined;
}> = ({ data, period, selectedRole }) => {
  const visitorLabel = period === 'day' ? 'Visitantes do dia' : 'Visitantes (soma dos dias)';
  const { totals, deltaPct } = data;

  return (
    <section aria-labelledby="traffic-kpis-title">
      <h2 id="traffic-kpis-title" className="sr-only">
        Indicadores principais de tráfego
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Visitas"
          value={formatNumber(totals.visits)}
          delta={buildDelta(deltaPct?.visits)}
        />
        <StatCard
          label={
            <Tooltip label={VISITOR_TOOLTIP}>
              <VisitorTooltipLabel label={visitorLabel} />
            </Tooltip>
          }
          value={formatNumber(totals.visitors)}
          delta={buildDelta(deltaPct?.visitors)}
        />
        <StatCard
          label="Sessões"
          value={formatNumber(totals.sessions)}
          delta={buildDelta(deltaPct?.sessions)}
        />
        <StatCard
          label="Usuários logados"
          value={formatNumber(totals.loggedInUsers)}
          delta={buildDelta(deltaPct?.loggedInUsers)}
        />
        <StatCard
          label="Novos salões"
          value={formatNumber(totals.newShops)}
          delta={buildDelta(deltaPct?.newShops)}
        />
        <StatCard
          label="Novos usuários"
          value={formatNumber(totals.newUsers)}
          hint={`dos quais removidos: ${formatNumber(totals.newUsersRemoved)} · ${roleContext(
            selectedRole
          )}`}
          delta={buildDelta(deltaPct?.newUsers)}
        />
      </div>
    </section>
  );
};

export const TrafficChart: React.FC<{ data: AdminTrafficData }> = ({ data }) => {
  if (data.series.length === 0) {
    return (
      <EmptyState
        title="Nenhum dado de tráfego no período"
        description={
          data.beaconEnabled
            ? 'A coleta está ativa, mas ainda não há registros para os filtros selecionados.'
            : 'A coleta está desativada e não há registros para os filtros selecionados.'
        }
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Evolução do tráfego</CardTitle>
          <p className="mt-1 text-xs text-text-muted">Visitas e visitantes por período</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-0 w-6 border-t-2"
              style={{ borderColor: 'var(--chart-1)' }}
            />
            Visitas
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-0 w-6 border-t-2 border-dashed"
              style={{ borderColor: 'var(--chart-2)' }}
            />
            Visitantes
          </span>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <ChartContainer
          id="traffic-series-chart"
          config={trafficChartConfig}
          className="aspect-auto h-64 w-full"
          role="img"
          aria-label="Gráfico de linhas de visitas e visitantes por período"
          aria-describedby="traffic-series-description"
        >
          <LineChart data={data.series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
              minTickGap={24}
              className="text-2xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={44}
              allowDecimals={false}
              className="text-2xs"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="visits"
              name="Visitas"
              stroke="var(--color-visits)"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="visitors"
              name="Visitantes"
              stroke="var(--color-visitors)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>

        <details open className="rounded-lg border border-border bg-surface-2 px-3 py-2">
          <summary className="cursor-pointer text-xs font-bold text-text-primary">
            Descrição textual do gráfico
          </summary>
          <div
            id="traffic-series-description"
            className="mt-2 space-y-2 text-xs text-text-secondary"
          >
            <p>
              Gráfico de linhas com duas séries: Visitas em linha contínua e Visitantes em linha
              tracejada.
            </p>
            <ul className="space-y-1">
              {data.series.map(point => (
                <li key={`description-${point.bucketStart}`}>
                  {point.label}: {formatNumber(point.visits)} visitas e{' '}
                  {formatNumber(point.visitors)} visitantes.
                </li>
              ))}
            </ul>
          </div>
        </details>
      </CardBody>
    </Card>
  );
};

export const TrafficSeriesTable: React.FC<{ data: AdminTrafficData }> = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle>Série do período</CardTitle>
    </CardHeader>
    <CardBody className="p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <caption className="sr-only">Série de tráfego por período</caption>
          <thead className="bg-surface-2 text-left text-xs text-text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Período
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Visitas
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Visitantes
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Sessões
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Novos salões
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Novos usuários
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                dos quais removidos
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Situação
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.series.map(point => (
              <tr
                key={point.bucketStart}
                className={point.partial ? 'bg-warning/10' : 'bg-surface'}
              >
                <th scope="row" className="px-4 py-3 text-left font-semibold text-text-primary">
                  {point.label}
                </th>
                <td className="px-4 py-3 text-text-secondary">{formatNumber(point.visits)}</td>
                <td className="px-4 py-3 text-text-secondary">{formatNumber(point.visitors)}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {point.sessions === null ? '—' : formatNumber(point.sessions)}
                </td>
                <td className="px-4 py-3 text-text-secondary">{formatNumber(point.newShops)}</td>
                <td className="px-4 py-3 text-text-secondary">{formatNumber(point.newUsers)}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {formatNumber(point.newUsersRemoved)}
                </td>
                <td className="px-4 py-3">
                  {point.partial ? (
                    <span className="inline-flex rounded-md border border-warning/40 bg-warning/10 px-2 py-1 text-xs font-bold text-warning">
                      {partialLabel(data.period.granularity)}
                    </span>
                  ) : (
                    <span className="text-xs text-text-muted">Completo</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardBody>
  </Card>
);

export const TrafficOrigins: React.FC<{ data: AdminTrafficData }> = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle>Origem do tráfego</CardTitle>
    </CardHeader>
    <CardBody>
      {data.origins.length === 0 ? (
        <p className="text-sm text-text-muted">Nenhuma origem registrada no período.</p>
      ) : (
        <ul className="divide-y divide-border/50">
          {data.origins.map(origin => (
            <li key={origin.host} className="flex items-center justify-between gap-4 py-2.5">
              <span className="min-w-0 truncate text-sm text-text-primary">{origin.host}</span>
              <span className="shrink-0 text-sm font-semibold text-text-secondary">
                {formatNumber(origin.visits)} visitas
              </span>
            </li>
          ))}
        </ul>
      )}
    </CardBody>
  </Card>
);

export const TrafficAreaSummary: React.FC<{ data: AdminTrafficData }> = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle>Resumo por área</CardTitle>
    </CardHeader>
    <CardBody className="p-0">
      {data.areas.length === 0 ? (
        <p className="px-5 py-6 text-sm text-text-muted">Nenhuma área com dados no período.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <caption className="sr-only">Resumo de tráfego por área</caption>
            <thead className="bg-surface-2 text-left text-xs text-text-muted">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Área
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Visitas
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Visitantes
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Sessões
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {data.areas.map(area => (
                <tr key={area.area}>
                  <th scope="row" className="px-5 py-3 text-left font-semibold text-text-primary">
                    {area.label}
                  </th>
                  <td className="px-5 py-3 text-text-secondary">{formatNumber(area.visits)}</td>
                  <td className="px-5 py-3 text-text-secondary">{formatNumber(area.visitors)}</td>
                  <td className="px-5 py-3 text-text-secondary">{formatNumber(area.sessions)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CardBody>
  </Card>
);

export const TrafficOverviewResults: React.FC<{
  data: AdminTrafficData;
  period: TrafficPeriod;
  selectedRole: TrafficUserRole | undefined;
}> = ({ data, period, selectedRole }) => (
  <div className="space-y-5">
    <TrafficNotices data={data} />
    <TrafficKpis data={data} period={period} selectedRole={selectedRole} />
    <TrafficChart data={data} />

    {data.series.length > 0 && <TrafficSeriesTable data={data} />}

    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <TrafficAreaSummary data={data} />
      <TrafficOrigins data={data} />
    </div>
  </div>
);
