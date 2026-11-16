import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LuDownload } from 'react-icons/lu';
import {
  adminTrafficApi,
  type AdminTrafficData,
  type AdminTrafficQuery,
  type TrafficArea,
  type TrafficPeriod,
  type TrafficUserRole,
} from '../../infra/adminTrafficApi';
import { Button } from '../../components/ui/Button';
import { DataTableState, SectionError } from '../../components/patterns';
import { TrafficOverviewFilters } from './TrafficOverviewFilters';
import { TrafficOverviewResults } from './TrafficOverviewPanels';
import {
  getSaoPauloCivilDate,
  isTrafficArea,
  isTrafficPeriod,
  isTrafficUserRole,
  normalizeDate,
  normalizeMonth,
} from './trafficOverviewUtils';

interface TrafficFilterState {
  period: TrafficPeriod;
  area: TrafficArea;
  selectedRole: TrafficUserRole | undefined;
  date: string | undefined;
  month: string | undefined;
  today: string;
  currentMonth: string;
  query: AdminTrafficQuery;
  onPeriodChange: (period: TrafficPeriod) => void;
  onAreaChange: (area: TrafficArea) => void;
  onRoleChange: (role: TrafficUserRole | undefined) => void;
  onDateChange: (date: string) => void;
  onMonthChange: (month: string) => void;
}

function useTrafficFilters(): TrafficFilterState {
  const [searchParams, setSearchParams] = useSearchParams();
  const today = getSaoPauloCivilDate();
  const currentMonth = today.slice(0, 7);

  const rawPeriod = searchParams.get('period');
  const period: TrafficPeriod = isTrafficPeriod(rawPeriod) ? rawPeriod : 'week';

  const rawArea = searchParams.get('area');
  const area: TrafficArea = isTrafficArea(rawArea) ? rawArea : 'all';

  const rawRole = searchParams.get('userRole');
  const selectedRole: TrafficUserRole | undefined = isTrafficUserRole(rawRole)
    ? rawRole
    : undefined;

  const date = period === 'day' ? normalizeDate(searchParams.get('date'), today) : undefined;
  const month =
    period === 'month' ? normalizeMonth(searchParams.get('month'), currentMonth) : undefined;

  const query = useMemo<AdminTrafficQuery>(
    () => ({
      period,
      area,
      ...(selectedRole ? { userRole: selectedRole } : {}),
      ...(date ? { date } : {}),
      ...(month ? { month } : {}),
    }),
    [area, date, month, period, selectedRole]
  );

  const updateParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const next = new URLSearchParams(searchParams);
      mutate(next);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    let changed = false;

    const setValue = (key: string, value: string) => {
      if (next.get(key) !== value) {
        next.set(key, value);
        changed = true;
      }
    };

    const deleteValue = (key: string) => {
      if (next.has(key)) {
        next.delete(key);
        changed = true;
      }
    };

    setValue('period', period);
    setValue('area', area);

    if (selectedRole) setValue('userRole', selectedRole);
    else deleteValue('userRole');

    if (period === 'day') {
      setValue('date', date ?? today);
      deleteValue('month');
    } else if (period === 'month') {
      setValue('month', month ?? currentMonth);
      deleteValue('date');
    } else {
      deleteValue('date');
      deleteValue('month');
    }

    if (changed) setSearchParams(next, { replace: true });
  }, [area, currentMonth, date, month, period, searchParams, selectedRole, setSearchParams, today]);

  const onPeriodChange = (nextPeriod: TrafficPeriod) => {
    if (nextPeriod === period) return;

    updateParams(params => {
      params.set('period', nextPeriod);
      params.delete('date');
      params.delete('month');
      if (nextPeriod === 'day') params.set('date', today);
      if (nextPeriod === 'month') params.set('month', currentMonth);
    });
  };

  const onAreaChange = (nextArea: TrafficArea) => {
    updateParams(params => params.set('area', nextArea));
  };

  const onRoleChange = (nextRole: TrafficUserRole | undefined) => {
    updateParams(params => {
      if (nextRole) params.set('userRole', nextRole);
      else params.delete('userRole');
    });
  };

  const onDateChange = (value: string) => {
    updateParams(params => params.set('date', normalizeDate(value, today)));
  };

  const onMonthChange = (value: string) => {
    updateParams(params => params.set('month', normalizeMonth(value, currentMonth)));
  };

  return {
    period,
    area,
    selectedRole,
    date,
    month,
    today,
    currentMonth,
    query,
    onPeriodChange,
    onAreaChange,
    onRoleChange,
    onDateChange,
    onMonthChange,
  };
}

interface TrafficReportState {
  report: AdminTrafficData | null;
  error: string | null;
  loading: boolean;
  retry: () => void;
}

function useTrafficReport(query: AdminTrafficQuery): TrafficReportState {
  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = useMemo(() => JSON.stringify([query, reloadKey]), [query, reloadKey]);
  const [state, setState] = useState<{
    requestKey: string;
    report: AdminTrafficData | null;
    error: string | null;
  }>({ requestKey: '', report: null, error: null });

  useEffect(() => {
    let active = true;

    adminTrafficApi
      .getTrafficReport(query)
      .then(response => {
        if (!active) return;
        setState({ requestKey, report: response.data, error: null });
      })
      .catch(() => {
        if (!active) return;
        setState({
          requestKey,
          report: null,
          error: 'Não foi possível carregar os dados de tráfego.',
        });
      });

    return () => {
      active = false;
    };
  }, [query, requestKey]);

  const isCurrentRequest = state.requestKey === requestKey;

  return {
    report: isCurrentRequest ? state.report : null,
    error: isCurrentRequest ? state.error : null,
    loading: !isCurrentRequest,
    retry: () => setReloadKey(key => key + 1),
  };
}

function useTrafficExport(query: AdminTrafficQuery): {
  exporting: boolean;
  exportError: string | null;
  exportCsv: () => Promise<void>;
} {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportCsv = async () => {
    setExporting(true);
    setExportError(null);
    let objectUrl: string | null = null;

    try {
      const response = await adminTrafficApi.exportTrafficCsv(query);
      if (!response.ok) throw new Error('Falha no export');

      const blob = new Blob([await response.blob()], { type: 'text/csv;charset=utf-8' });
      objectUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `trafego-${query.period}-${query.date ?? query.month ?? 'periodo'}.csv`;
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch {
      setExportError('Não foi possível exportar os dados de tráfego.');
    } finally {
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
      setExporting(false);
    }
  };

  return { exporting, exportError, exportCsv };
}

export const TrafficOverviewDashboard: React.FC = () => {
  const filters = useTrafficFilters();
  const { report, error, loading, retry } = useTrafficReport(filters.query);
  const { exporting, exportError, exportCsv } = useTrafficExport(filters.query);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Tráfego</h1>
          <p className="mt-1 text-sm text-text-muted">
            Visitas anônimas, atividade de usuários e cadastros no período selecionado.
          </p>
        </div>
        <Button
          variant="secondary"
          loading={exporting}
          disabled={!report || report.series.length === 0}
          onClick={() => void exportCsv()}
        >
          <LuDownload size={16} aria-hidden="true" />
          {exporting ? 'Exportando...' : 'Exportar CSV'}
        </Button>
      </header>

      {exportError && <SectionError message={exportError} />}

      <TrafficOverviewFilters
        period={filters.period}
        area={filters.area}
        selectedRole={filters.selectedRole}
        date={filters.date}
        month={filters.month}
        today={filters.today}
        currentMonth={filters.currentMonth}
        onPeriodChange={filters.onPeriodChange}
        onAreaChange={filters.onAreaChange}
        onRoleChange={filters.onRoleChange}
        onDateChange={filters.onDateChange}
        onMonthChange={filters.onMonthChange}
      />

      {loading && (
        <DataTableState
          loading
          skeletonProps={{ rows: 6, cols: 8, className: 'rounded-xl border border-border' }}
        />
      )}

      {!loading && error && <DataTableState error={error} onRetry={retry} />}

      {!loading && !error && report && (
        <TrafficOverviewResults
          data={report}
          period={filters.period}
          selectedRole={filters.selectedRole}
        />
      )}
    </div>
  );
};
