import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  Lightbulb,
  Loader2,
  Sparkles,
  ThumbsDown,
  X,
} from 'lucide-react';
import { recommendationsApi, Recommendation } from '../../infra/recommendationsApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { ConfirmDialog } from '../ui/ConfirmDialog';

const PRIORITY_CONFIG: Record<string, { label: string; className: string; dotClass: string }> = {
  high: {
    label: 'Alta',
    className: 'border-danger/30 bg-danger/8',
    dotClass: 'bg-danger',
  },
  medium: {
    label: 'Média',
    className: 'border-warning/30 bg-warning/8',
    dotClass: 'bg-warning',
  },
  low: {
    label: 'Baixa',
    className: 'border-success/30 bg-success/8',
    dotClass: 'bg-success',
  },
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
      const res = await recommendationsApi.getRecommendations(barbershopId);
      const data = Array.isArray(res) ? res : (res as any)?.data ?? [];
      setRecommendations(data);
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
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Recomendações</h2>
          <p className="text-sm text-text-muted">
            Insights inteligentes para melhorar seu negócio
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium text-text-secondary transition-colors hover:bg-bg hover:text-text-primary disabled:opacity-50"
        >
          <Sparkles size={15} />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {recommendations.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center shadow-[0_18px_44px_-32px_rgba(0,0,0,0.65)]">
          <Lightbulb size={40} className="mx-auto text-text-muted" />
          <p className="mt-3 text-sm font-medium text-text-primary">
            Nenhuma recomendação no momento
          </p>
          <p className="text-xs text-text-muted">
            Continue operando normalmente — novas sugestões aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map(rec => {
            const priority = PRIORITY_CONFIG[rec.priority] ?? PRIORITY_CONFIG.low;
            return (
              <div
                key={rec.id}
                className={`rounded-2xl border bg-surface p-5 shadow-[0_18px_44px_-32px_rgba(0,0,0,0.65)] ${priority.className}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${priority.dotClass}`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-text-primary">{rec.title}</h3>
                        <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[10px] font-bold uppercase text-text-muted">
                          {priority.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-text-muted">{rec.type}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDismissTarget(rec)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:bg-bg hover:text-text-primary"
                    aria-label="Dispensar recomendação"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="mt-3 space-y-2 pl-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      Motivo
                    </p>
                    <p className="mt-0.5 text-sm text-text-secondary">{rec.reason}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      Impacto esperado
                    </p>
                    <p className="mt-0.5 text-sm text-text-secondary">{rec.impact}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-bg p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
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
    </div>
  );
};
