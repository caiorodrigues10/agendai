import React from 'react';
import {
  TRAFFIC_USER_ROLES,
  type TrafficArea,
  type TrafficPeriod,
  type TrafficUserRole,
} from '../../infra/adminTrafficApi';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Tabs,
  type TabItem,
} from '../../components/patterns';
import { AREA_LABELS, PERIOD_LABELS, ROLE_LABELS } from './trafficOverviewUtils';

interface TrafficOverviewFiltersProps {
  period: TrafficPeriod;
  area: TrafficArea;
  selectedRole: TrafficUserRole | undefined;
  date: string | undefined;
  month: string | undefined;
  today: string;
  currentMonth: string;
  onPeriodChange: (period: TrafficPeriod) => void;
  onAreaChange: (area: TrafficArea) => void;
  onRoleChange: (role: TrafficUserRole | undefined) => void;
  onDateChange: (date: string) => void;
  onMonthChange: (month: string) => void;
}

export const TrafficOverviewFilters: React.FC<TrafficOverviewFiltersProps> = ({
  period,
  area,
  selectedRole,
  date,
  month,
  today,
  currentMonth,
  onPeriodChange,
  onAreaChange,
  onRoleChange,
  onDateChange,
  onMonthChange,
}) => {
  const periodTabs = (Object.keys(PERIOD_LABELS) as TrafficPeriod[]).map(id => ({
    id,
    label: PERIOD_LABELS[id],
  })) satisfies TabItem<TrafficPeriod>[];

  const areaTabs = (Object.keys(AREA_LABELS) as TrafficArea[]).map(id => ({
    id,
    label: AREA_LABELS[id],
  })) satisfies TabItem<TrafficArea>[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardBody className="space-y-5">
        <div>
          <p className="mb-2 text-xs font-semibold text-text-muted">Período</p>
          <Tabs
            ariaLabel="Período do relatório de tráfego"
            items={periodTabs}
            value={period}
            onChange={onPeriodChange}
            idPrefix="traffic-period"
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-text-muted">Área</p>
          <Tabs
            ariaLabel="Área do relatório de tráfego"
            items={areaTabs}
            value={area}
            onChange={onAreaChange}
            idPrefix="traffic-area"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {period === 'day' && (
            <label className="flex max-w-xs flex-col gap-1.5 text-xs font-semibold text-text-muted">
              Data
              <input
                type="date"
                value={date ?? today}
                max={today}
                onChange={event => onDateChange(event.target.value)}
                className="min-h-11 rounded-lg border border-border bg-bg px-3 text-sm font-normal text-text-primary focus:border-accent focus:outline-none"
              />
            </label>
          )}

          {period === 'month' && (
            <label className="flex max-w-xs flex-col gap-1.5 text-xs font-semibold text-text-muted">
              Mês de referência
              <input
                type="month"
                value={month ?? currentMonth}
                max={currentMonth}
                onChange={event => onMonthChange(event.target.value)}
                className="min-h-11 rounded-lg border border-border bg-bg px-3 text-sm font-normal text-text-primary focus:border-accent focus:outline-none"
              />
            </label>
          )}

          <label className="flex max-w-xs flex-col gap-1.5 text-xs font-semibold text-text-muted">
            Papel dos novos usuários
            <select
              value={selectedRole ?? ''}
              onChange={event => {
                const nextRole = event.target.value as TrafficUserRole | '';
                onRoleChange(nextRole || undefined);
              }}
              className="min-h-11 rounded-lg border border-border bg-bg px-3 text-sm font-normal text-text-primary focus:border-accent focus:outline-none"
            >
              <option value="">Todos os papéis</option>
              {TRAFFIC_USER_ROLES.map(role => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </CardBody>
    </Card>
  );
};
