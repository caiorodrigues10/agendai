import React, { useCallback, useEffect, useState } from 'react';
import {
  LuCircleAlert as AlertCircle,
  LuArrowUpRight as ArrowUpRight,
  LuCalendarClock as CalendarClock,
  LuPackageSearch as PackageSearch,
  LuLightbulb as Lightbulb,
  LuLoaderCircle as Loader2,
  LuSparkles as Sparkles,
  LuTarget as Target,
  LuUserRoundX as UserRoundX,
  LuX as X,
} from 'react-icons/lu';
import { recommendationsApi, Recommendation } from '../../infra/recommendationsApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { ConfirmDialog } from '../ui/ConfirmDialog';

const PRIORITY_CONFIG: Record<string, { label: string; className: string; dotClass: string }> = {
  high: {
    label: 'Alta',
    className: 'border-danger/25 bg-danger/10 text-danger',
    dotClass: 'bg-danger',
  },
  medium: {
    label: 'Média',
    className: 'border-warning/25 bg-warning/10 text-warning',
    dotClass: 'bg-warning',
  },
  low: {
    label: 'Baixa',
    className: 'border-success/25 bg-success/10 text-success',
    dotClass: 'bg-success',
  },
};

const TYPE_CONFIG: Record<string, { label: string; icon: typeof CalendarClock }> = {
  LOW_OCCASION_TOMORROW: { label: 'Ocupação da agenda', icon: CalendarClock },
  CLIENT_OVERDUE: { label: 'Retenção de clientes', icon: UserRoundX },
  PRODUCT_REORDER: { label: 'Reposição de estoque', icon: PackageSearch },
  PROFESSIONAL_UNDERPERFORMING: { label: 'Desempenho da equipe', icon: Target },
};

export const RecommendationsPanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissTarget, setDismissTarget] = useState<Recommendation | null>(null);
  const [dismissing, setDismissing] = useState(false);

  const load = useCallback(async () => {
    if (!barbershopId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await recommendationsApi.getRecommendations(barbershopId);
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDismiss = async () => {
    if (!barbershopId || !dismissTarget) return;
    setDismissing(true);
    try {
      await recommendationsApi.dismiss(barbershopId, dismissTarget.id);
      setRecommendations(prev => prev.filter(r => r.id !== dismissTarget.id));
      setDismissTarget(null);
    } catch {
      // silently fail
    } finally {
      setDismissing(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-border bg-surface p-6">
        <div className="flex items-center justify-center gap-3 py-16 text-sm text-text-muted">
          <Loader2 size={20} className="animate-spin text-accent" />
          Analisando oportunidades do seu negócio...
        </div>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_24px_70px_-46px_rgba(0,0,0,0.9)]">
      <div className="flex flex-col gap-4 border-b border-border bg-gradient-to-r from-accent/10 via-transparent to-transparent p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
            <Sparkles size={19} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-text-primary">Próximas oportunidades</h2>
              <span className="rounded-full border border-border bg-bg/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                {recommendations.length} {recommendations.length === 1 ? 'sugestão' : 'sugestões'}
              </span>
            </div>
            <p className="mt-1 text-sm text-text-muted">
              Ações práticas priorizadas a partir da sua agenda e operação.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-bg/70 px-4 text-sm font-semibold text-text-secondary transition-all hover:border-accent/30 hover:text-accent disabled:opacity-50"
        >
          <Sparkles size={15} />
          Atualizar
        </button>
      </div>

      <div className="p-4 sm:p-6">
        {error && (
        <div className="flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
        )}

        {recommendations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-bg/40 px-6 py-14 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success">
            <Lightbulb size={25} />
          </span>
          <p className="mt-4 text-base font-semibold text-text-primary">
            Tudo em ordem por enquanto
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-text-muted">
            Novas oportunidades aparecerão aqui conforme a agenda, clientes e estoque mudarem.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map(rec => {
            const priority = PRIORITY_CONFIG[rec.priority] ?? PRIORITY_CONFIG.low;
            const type = TYPE_CONFIG[rec.type] ?? { label: 'Oportunidade do negócio', icon: Lightbulb };
            const TypeIcon = type.icon;
            return (
              <div
                key={rec.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-bg/45 p-4 transition-all hover:border-border-strong sm:p-5"
              >
                <span className={`absolute inset-y-0 left-0 w-1 ${priority.dotClass}`} />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-accent">
                      <TypeIcon size={18} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                          {type.label}
                        </span>
                        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${priority.className}`}>
                          {priority.label}
                        </span>
                      </div>
                      <h3 className="mt-1 text-base font-bold leading-snug text-text-primary">{rec.title}</h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDismissTarget(rec)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary"
                    aria-label="Dispensar recomendação"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_1.35fr]">
                  <div className="rounded-xl border border-border/70 bg-surface/55 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      Motivo
                    </p>
                    <p className="mt-0.5 text-sm text-text-secondary">{rec.reason}</p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-surface/55 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      Impacto esperado
                    </p>
                    <p className="mt-0.5 text-sm text-text-secondary">{rec.impact}</p>
                  </div>
                  <div className="rounded-xl border border-accent/20 bg-accent/8 p-3">
                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                      <ArrowUpRight size={12} />
                      Ação sugerida
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-text-primary">
                      {rec.suggestedAction}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      <ConfirmDialog
        open={!!dismissTarget}
        title="Dispensar recomendação"
        message={`Tem certeza que deseja dispensar "${dismissTarget?.title}"?`}
        confirmLabel="Dispensar"
        variant="default"
        loading={dismissing}
        onConfirm={handleDismiss}
        onCancel={() => setDismissTarget(null)}
      />
    </section>
  );
};
