import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LuArrowRight, LuInfo, LuRadioTower, LuUsersRound } from 'react-icons/lu';
import { adminTrafficApi, type AdminTrafficData } from '../../infra/adminTrafficApi';
import { useAuth } from '../../contexts/AuthContext';
import {
  Card,
  CardBody,
  CardSkeleton,
  SectionError,
  SkeletonRegion,
  StatCard,
  Tooltip,
} from '../../components/patterns';
import { formatNumber, getSaoPauloCivilDate, getVisitorBasisTooltip } from './trafficOverviewUtils';
import { hasInternalPermission, INTERNAL_PERMISSIONS } from '../../utils/internalPermissions';

interface TrafficVisitorsState {
  requestId: number;
  day: AdminTrafficData | null;
  week: AdminTrafficData | null;
  error: string | null;
}

const VisitorMetric: React.FC<{
  label: string;
  value: number;
  basis: AdminTrafficData['totals']['visitorsBasis'];
}> = ({ label, value, basis }) => (
  <span className="block">
    <Tooltip label={getVisitorBasisTooltip(basis)}>
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded text-xs font-semibold uppercase tracking-wide text-text-muted focus:outline-none focus:ring-2 focus:ring-focus"
      >
        {label}
        <LuInfo size={12} aria-hidden="true" />
      </button>
    </Tooltip>
    <span className="mt-1 block text-2xl font-bold text-text-primary">{formatNumber(value)}</span>
  </span>
);

/**
 * Resumo de entrada no site para a visão geral do master admin.
 *
 * A permissão é verificada antes de qualquer requisição. Os relatórios de
 * dia e semana usam a área "all" para representar todo o site.
 */
export const OverviewTrafficCard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const canReadTraffic =
    !authLoading &&
    user?.role === 'MASTER_ADMIN' &&
    hasInternalPermission(user.internalPermissions, INTERNAL_PERMISSIONS.TRAFFIC_READ);

  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<TrafficVisitorsState>({
    requestId: -1,
    day: null,
    week: null,
    error: null,
  });

  useEffect(() => {
    if (!canReadTraffic) return;

    let active = true;

    Promise.all([
      adminTrafficApi.getTrafficReport({
        period: 'day',
        area: 'all',
        date: getSaoPauloCivilDate(),
      }),
      adminTrafficApi.getTrafficReport({ period: 'week', area: 'all' }),
    ])
      .then(([day, week]) => {
        if (!active) return;
        setState({
          requestId: reloadKey,
          day: day.data,
          week: week.data,
          error: null,
        });
      })
      .catch(() => {
        if (!active) return;
        setState({
          requestId: reloadKey,
          day: null,
          week: null,
          error: 'Não foi possível carregar os números de visitantes.',
        });
      });

    return () => {
      active = false;
    };
  }, [canReadTraffic, reloadKey]);

  const retry = useCallback(() => setReloadKey(key => key + 1), []);

  if (!canReadTraffic) return null;

  const isCurrentRequest = state.requestId === reloadKey;
  const loading = !isCurrentRequest;
  const error = isCurrentRequest ? state.error : null;
  const day = isCurrentRequest ? state.day : null;
  const week = isCurrentRequest ? state.week : null;

  if (loading) {
    return (
      <SkeletonRegion loading label="Carregando pessoas que entraram">
        <CardSkeleton variant="stat" />
      </SkeletonRegion>
    );
  }

  if (error) {
    return <SectionError message={error} onRetry={retry} />;
  }

  if (!day || !week) return null;

  if (!day.beaconEnabled || !week.beaconEnabled) {
    return (
      <Card>
        <CardBody className="space-y-3">
          <div role="status" className="flex items-start gap-3 text-sm text-text-primary">
            <LuRadioTower className="mt-0.5 shrink-0 text-accent" size={18} aria-hidden="true" />
            <div>
              <p className="font-semibold">A coleta de tráfego está desativada.</p>
              <p className="mt-1 text-text-secondary">
                Por isso, os números de visitantes não são exibidos.
              </p>
            </div>
          </div>
          <Link
            to="/master/traffic"
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
          >
            Ver detalhes do tráfego
            <LuArrowRight size={14} aria-hidden="true" />
          </Link>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="rounded-xl transition hover:-translate-y-0.5 hover:shadow-md">
      <StatCard
        label={
          <Link
            to="/master/traffic"
            className="rounded focus:outline-none focus:ring-2 focus:ring-focus"
          >
            Pessoas que entraram
          </Link>
        }
        value={
          <span className="grid grid-cols-2 gap-4">
            <VisitorMetric
              label="Hoje"
              value={day.totals.visitors}
              basis={day.totals.visitorsBasis}
            />
            <VisitorMetric
              label="Últimos 7 dias"
              value={week.totals.visitors}
              basis={week.totals.visitorsBasis}
            />
          </span>
        }
        hint={
          <Link
            to="/master/traffic"
            className="inline-flex items-center gap-1 rounded hover:underline focus:outline-none focus:ring-2 focus:ring-focus"
          >
            Ver detalhes do tráfego
            <LuArrowRight size={13} aria-hidden="true" />
          </Link>
        }
        icon={<LuUsersRound size={18} aria-hidden="true" />}
      />
    </div>
  );
};

export default OverviewTrafficCard;
