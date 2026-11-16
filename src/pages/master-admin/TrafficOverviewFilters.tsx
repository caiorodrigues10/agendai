import React, { useId } from 'react';
import {
  TRAFFIC_USER_ROLES,
  type TrafficArea,
  type TrafficPeriod,
  type TrafficUserRole,
} from '../../infra/adminTrafficApi';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/patterns';
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

interface FilterChoiceGroupProps<T extends string> {
  /** Id of the visible label that names the group. */
  labelledBy: string;
  items: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}

/**
 * Segmented filter control.
 *
 * Period/area are *filters*, not content tabs: a tablist would require a real
 * tabpanel for every `aria-controls` it emits. These are plain buttons with
 * `aria-pressed`, so assistive tech gets a valid group with no dangling IDs.
 */
function FilterChoiceGroup<T extends string>({
  labelledBy,
  items,
  value,
  onChange,
}: FilterChoiceGroupProps<T>) {
  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      className="flex min-w-0 flex-wrap gap-1 rounded-xl border border-border bg-surface p-1"
    >
      {items.map(item => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(item.id)}
            className={`min-h-11 min-w-0 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
              active
                ? 'bg-accent/15 text-accent'
                : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
            }`}
          >
            <span className="inline-flex items-center gap-2">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
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
  const periodLabelId = useId();
  const areaLabelId = useId();

  const periodItems = (Object.keys(PERIOD_LABELS) as TrafficPeriod[]).map(id => ({
    id,
    label: PERIOD_LABELS[id],
  }));

  const areaItems = (Object.keys(AREA_LABELS) as TrafficArea[]).map(id => ({
    id,
    label: AREA_LABELS[id],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardBody className="space-y-5">
        <div>
          <p id={periodLabelId} className="mb-2 text-xs font-semibold text-text-muted">
            Período
          </p>
          <FilterChoiceGroup
            labelledBy={periodLabelId}
            items={periodItems}
            value={period}
            onChange={onPeriodChange}
          />
        </div>

        <div>
          <p id={areaLabelId} className="mb-2 text-xs font-semibold text-text-muted">
            Área
          </p>
          <FilterChoiceGroup
            labelledBy={areaLabelId}
            items={areaItems}
            value={area}
            onChange={onAreaChange}
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
