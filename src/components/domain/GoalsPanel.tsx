import React, { useCallback, useEffect, useState } from 'react';
import {
  LuCircleAlert as AlertCircle,
  LuLoaderCircle as Loader2,
  LuPlus as Plus,
  LuTarget as Target,
  LuTrophy as Trophy,
  LuX as X,
} from 'react-icons/lu';
import { goalsApi, ProfessionalGoal } from '../../infra/goalsApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { useBarbershop } from '../../contexts/BarbershopContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { formatCurrencyBRL, formatDateBR } from '../../utils/formatters';
import { Field, FIELD_CONTROL, FORM_FOOTER } from '../ui/Field';
import { formatPercentBR } from '../../utils/formatters';
import { SmartSelect } from '../ui/SmartSelect';

type GoalMetric = 'REVENUE' | 'APPOINTMENTS' | 'PRODUCTS_SOLD';

const METRIC_LABELS: Record<GoalMetric, string> = {
  REVENUE: 'Faturamento',
  APPOINTMENTS: 'Atendimentos',
  PRODUCTS_SOLD: 'Produtos vendidos',
};

interface GoalFormData {
  professionalId: string;
  metric: GoalMetric;
  target: string;
  startDate: string;
  endDate: string;
}

const INITIAL_FORM: GoalFormData = {
  professionalId: '',
  metric: 'REVENUE',
  target: '',
  startDate: '',
  endDate: '',
};

const progressColor = (pct: number) => {
  if (pct >= 80) return 'bg-success';
  if (pct >= 50) return 'bg-warning';
  return 'bg-danger';
};

const progressWidth = (pct: number) => `${Math.min(pct, 100)}%`;

const formatMetricValue = (value: number, metric: string) => {
  if (metric === 'REVENUE' || metric === 'PRODUCTS_SOLD') return formatCurrencyBRL(value);
  return String(value);
};

export const GoalsPanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();
  const { staff } = useBarbershop();

  const [goals, setGoals] = useState<ProfessionalGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState<GoalFormData>(INITIAL_FORM);
  const metricOptions = (Object.keys(METRIC_LABELS) as GoalMetric[]).map(metric => ({
    value: metric,
    label: METRIC_LABELS[metric],
  }));

  const load = useCallback(async () => {
    if (!barbershopId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await goalsApi.getRanking(barbershopId);
      const staffNames = new Map((staff ?? []).map(member => [member.id, member.name]));
      setGoals(
        (Array.isArray(data) ? data : []).map(goal => ({
          ...goal,
          professionalName: goal.professionalName ?? staffNames.get(goal.professionalId),
        }))
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [barbershopId, staff]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async () => {
    if (!barbershopId || !form.professionalId) return;
    const target = parseFloat(form.target);
    if (isNaN(target) || target <= 0) {
      setSubmitError('Meta inválida');
      return;
    }
    if (!form.startDate || !form.endDate) {
      setSubmitError('Selecione o período');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await goalsApi.create(barbershopId, {
        professionalId: form.professionalId,
        metric: form.metric,
        target,
        startDate: form.startDate,
        endDate: form.endDate,
      });
      setModalOpen(false);
      setForm(INITIAL_FORM);
      load();
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const sorted = [...goals].sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Metas Profissionais</h2>
          <p className="text-sm text-text-muted">Ranking de desempenho da equipe</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium text-text-secondary transition-colors hover:bg-bg hover:text-text-primary disabled:opacity-50"
          >
            <Target size={15} />
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-fg shadow-md shadow-accent/15 transition-colors hover:opacity-90"
          >
            <Plus size={16} />
            Criar meta
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center shadow-[0_18px_44px_-32px_rgba(0,0,0,0.65)]">
          <Trophy size={40} className="mx-auto text-text-muted" />
          <p className="mt-3 text-sm text-text-muted">Nenhuma meta configurada</p>
          <p className="text-xs text-text-muted">Crie metas para acompanhar o desempenho da equipe.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((goal, index) => (
            <div
              key={goal.id}
              className="rounded-2xl border border-border bg-surface p-5 shadow-[0_18px_44px_-32px_rgba(0,0,0,0.65)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      index === 0
                        ? 'bg-yellow-400 text-yellow-900'
                        : index === 1
                        ? 'bg-gray-300 text-gray-700'
                        : index === 2
                        ? 'bg-amber-600 text-amber-100'
                        : 'bg-surface-2 text-text-muted'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {goal.professionalName ?? 'Profissional'}
                    </p>
                    <p className="text-xs text-text-muted">
                      {METRIC_LABELS[goal.metric as GoalMetric] ?? goal.metric}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-text-primary">
                    {formatMetricValue(goal.current, goal.metric)}
                  </p>
                  <p className="text-xs text-text-muted">
                    Meta: {formatMetricValue(goal.target, goal.metric)}
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[11px] text-text-muted">
                    {formatDateBR(goal.startDate)} — {formatDateBR(goal.endDate)}
                  </span>
                  <span className="text-[11px] font-semibold text-text-primary">
                    {formatPercentBR(goal.percentage / 100)}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${progressColor(goal.percentage)}`}
                    style={{ width: progressWidth(goal.percentage) }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Criar meta</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text-secondary transition-colors hover:bg-bg hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Profissional">
                <SmartSelect
                  value={form.professionalId || null}
                  onChange={value => setForm(f => ({ ...f, professionalId: value ?? '' }))}
                  options={staff.map(member => ({ value: member.id, label: member.name }))}
                  placeholder="Selecione o profissional"
                  searchable
                />
              </Field>

              <Field label="Métrica">
                <SmartSelect
                  value={form.metric}
                  onChange={value => setForm(f => ({ ...f, metric: value ?? 'REVENUE' }))}
                  options={metricOptions}
                  searchable
                  clearable={false}
                />
              </Field>

              <Field label="Meta (valor)">
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Ex: 5000"
                  value={form.target}
                  onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                  className={FIELD_CONTROL}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Data início">
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className={FIELD_CONTROL}
                  />
                </Field>
                <Field label="Data fim">
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className={FIELD_CONTROL}
                  />
                </Field>
              </div>

              {submitError && (
                <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                  <AlertCircle size={14} />
                  {submitError}
                </div>
              )}
            </div>

            <div className={FORM_FOOTER}>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 rounded-xl border border-border bg-bg px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !form.professionalId || !form.target || !form.startDate || !form.endDate}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-fg shadow-md shadow-accent/15 transition-colors hover:opacity-90 disabled:opacity-50"
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                Criar meta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
