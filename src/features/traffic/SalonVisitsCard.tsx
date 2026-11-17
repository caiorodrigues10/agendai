import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LuArrowRight, LuInfo, LuRadioTower, LuUsersRound } from 'react-icons/lu';
import { getSalonTraffic, type SalonTrafficData } from '../../infra/salonTrafficApi';
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
import { getVisitorBasisTooltip } from '../../shared/trafficVisitorBasis';

interface SalonVisitorsState {
  requestId: number;
  day: SalonTrafficData | null;
  week: SalonTrafficData | null;
  error: string | null;
}

const VisitorMetric: React.FC<{
  label: string;
  value: number;
  basis: SalonTrafficData['totals']['visitorsBasis'];
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
    <span className="mt-1 block text-2xl font-bold text-text-primary">
      {value.toLocaleString('pt-BR')}
    </span>
  </span>
);

interface SalonVisitsCardProps {
  barbershopId: string;
}

/**
 * Resumo "Visitas ao seu salão" na aba Hoje do painel do dono.
 *
 * A permissão (OWNER/MASTER_ADMIN) é verificada antes de qualquer requisição;
 * o link leva à seção detalhada na aba Link Público.
 */
export const SalonVisitsCard: React.FC<SalonVisitsCardProps> = ({ barbershopId }) => {
  const { user, loading: authLoading } = useAuth();
  const canView =
    !authLoading && (user?.role === 'OWNER' || user?.role === 'MASTER_ADMIN') && Boolean(barbershopId);

  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<SalonVisitorsState>({
    requestId: -1,
    day: null,
    week: null,
    error: null,
  });

  useEffect(() => {
    if (!canView) return;

    let active = true;

    Promise.all([
      getSalonTraffic(barbershopId, { period: 'day' }),
      getSalonTraffic(barbershopId, { period: 'week' }),
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
          error: 'Não foi possível carregar as visitas ao seu salão.',
        });
      });

    return () => {
      active = false;
    };
  }, [canView, barbershopId, reloadKey]);

  const retry = useCallback(() => setReloadKey(key => key + 1), []);

  if (!canView) return null;

  const isCurrentRequest = state.requestId === reloadKey;
  const loading = !isCurrentRequest;
  const error = isCurrentRequest ? state.error : null;
  const day = isCurrentRequest ? state.day : null;
  const week = isCurrentRequest ? state.week : null;

  if (loading) {
    return (
      <SkeletonRegion loading label="Carregando visitas ao seu salão">
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
                Por isso, os números de visitas não são exibidos.
              </p>
            </div>
          </div>
          <Link
            to="/app/link"
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
          >
            Ver detalhes das visitas
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
            to="/app/link"
            className="rounded focus:outline-none focus:ring-2 focus:ring-focus"
          >
            Visitas ao seu salão
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
            to="/app/link"
            className="inline-flex items-center gap-1 rounded hover:underline focus:outline-none focus:ring-2 focus:ring-focus"
          >
            Ver detalhes
            <LuArrowRight size={13} aria-hidden="true" />
          </Link>
        }
        icon={<LuUsersRound size={18} aria-hidden="true" />}
      />
    </div>
  );
};

export default SalonVisitsCard;
