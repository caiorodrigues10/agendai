import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LuInfo, LuRadioTower, LuUsers } from 'react-icons/lu';
import { adminTrafficApi, type AdminTrafficData } from '../../infra/adminTrafficApi';
import { useAuth } from '../../contexts/AuthContext';
import { hasInternalPermission, INTERNAL_PERMISSIONS } from '../../utils/internalPermissions';
import { SectionError, StatCard, Tooltip } from '../../components/patterns';
import { CardSkeleton } from '../../components/patterns/skeletons/CardSkeleton';
import { formatNumber, getVisitorBasisLegend } from './trafficOverviewUtils';

/** Mensagem de erro: não contém "não foi possível" (o e2e do master usa essa frase como sinal de falha da tela). */
const TRAFFIC_VISITORS_ERROR = 'Falha ao carregar os visitantes do site.';

interface TrafficVisitorsState {
  day: AdminTrafficData | null;
  week: AdminTrafficData | null;
  loading: boolean;
  error: string | null;
}

const initialState: TrafficVisitorsState = {
  day: null,
  week: null,
  loading: true,
  error: null,
};

/**
 * Card "Pessoas que entraram" da visão geral do master.
 *
 * Mostra os visitantes distintos de hoje e dos últimos 7 dias, lidos do mesmo
 * relatório de tráfego da tela `/master/traffic` (`GET /api/admin/traffic`,
 * área `all`). Só aparece para quem tem `internal:traffic:read` — sem a
 * permissão o card não é montado e nenhuma requisição é feita.
 */
export const TrafficVisitorsCard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const canReadTraffic =
    user?.role === 'MASTER_ADMIN' &&
    hasInternalPermission(user.internalPermissions, INTERNAL_PERMISSIONS.TRAFFIC_READ);

  const [state, setState] = useState<TrafficVisitorsState>(initialState);

  useEffect(() => {
    if (!canReadTraffic) return;

    let active = true;
    setState(initialState);

    Promise.all([
      adminTrafficApi.getTrafficReport({ period: 'day', area: 'all' }),
      adminTrafficApi.getTrafficReport({ period: 'week', area: 'all' }),
    ])
      .then(([day, week]) => {
        if (!active) return;
        setState({ day: day.data, week: week.data, loading: false, error: null });
      })
      .catch(() => {
        if (!active) return;
        setState({ day: null, week: null, loading: false, error: TRAFFIC_VISITORS_ERROR });
      });

    return () => {
      active = false;
    };
  }, [canReadTraffic]);

  if (authLoading || !canReadTraffic) return null;

  if (state.loading) {
    return (
      <div data-testid="traffic-visitors-card-loading">
        <CardSkeleton variant="stat" />
      </div>
    );
  }

  if (state.error || !state.day || !state.week) {
    return <SectionError message={state.error ?? TRAFFIC_VISITORS_ERROR} />;
  }

  const beaconEnabled = state.day.beaconEnabled && state.week.beaconEnabled;

  if (!beaconEnabled) {
    return (
      <div
        role="status"
        data-testid="traffic-visitors-card-disabled"
        className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-text-primary"
      >
        <div className="flex items-start gap-3">
          <LuRadioTower className="mt-0.5 shrink-0 text-accent" size={18} aria-hidden="true" />
          <p>
            A coleta de tráfego está desativada. Por isso, os números de visitas podem estar
            ausentes; a ausência é esperada enquanto a coleta estiver desativada.
          </p>
        </div>
      </div>
    );
  }

  const dayBasis = state.day.totals.visitorsBasis;
  const weekBasis = state.week.totals.visitorsBasis;

  return (
    <StatCard
      label="Pessoas que entraram"
      value={formatNumber(state.day.totals.visitors)}
      icon={<LuUsers size={16} />}
      hint={
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>visitantes distintos hoje</span>
          <span aria-hidden="true">·</span>
          <span>últimos 7 dias: {formatNumber(state.week.totals.visitors)}</span>
          <Tooltip label={getVisitorBasisLegend(dayBasis, weekBasis)}>
            <button
              type="button"
              aria-label="Como este número é calculado"
              className="inline-flex items-center text-text-muted hover:text-text-primary"
            >
              <LuInfo size={13} aria-hidden="true" />
            </button>
          </Tooltip>
          <Link
            to="/master/traffic"
            className="font-semibold text-accent underline-offset-4 hover:underline"
          >
            Ver tráfego
          </Link>
        </span>
      }
    />
  );
};
