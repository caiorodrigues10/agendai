import React, { useEffect, useState } from 'react';
import { ModalShell } from '../../components/patterns/ModalShell';
import { Plan, plansApi } from '../../infra/plansApi';

export type ActionExtra = 'days' | 'plans';

export interface AccountActionDialogProps {
  open: boolean;
  title: string;
  message: string;
  extra?: ActionExtra;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  error?: string | null;
  onConfirm: (reason: string, extra: { days?: number; planId?: string }) => void;
  onCancel: () => void;
}

const MIN_REASON = 10;

const isSubmitAllowed = (
  extra: ActionExtra | undefined,
  reason: string,
  days: number,
  planId: string,
): boolean => {
  if (reason.trim().length < MIN_REASON) return false;
  if (extra === 'days' && (!Number.isInteger(days) || days < 1 || days > 90)) return false;
  // planId só é preenchido quando a lista de planos carrega com sucesso.
  if (extra === 'plans' && planId === '') return false;
  return true;
};

/** Select de plano ativo (carrega /api/plans na montagem). */
const PLAN_SELECT_ID = 'account-action-plan';

const PlanSelect: React.FC<{ value: string; onChange: (id: string) => void }> = ({ value, onChange }) => {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    plansApi
      .list()
      .then((list) => {
        if (!active) return;
        setPlans(list);
        if (list.length > 0) onChange(list[0].id);
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar os planos.');
      });
    return () => {
      active = false;
    };
  }, [onChange]);

  if (error) return <p className="text-xs text-danger">{error}</p>;
  if (plans === null) return <p className="text-xs text-text-muted">Carregando planos…</p>;

  return (
    <select
      id={PLAN_SELECT_ID}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-text-primary"
    >
      {plans.map((plan) => (
        <option key={plan.id} value={plan.id}>
          {plan.name} · R$ {plan.price}
        </option>
      ))}
    </select>
  );
};

/**
 * Modal de confirmação de ação de controle sobre uma conta: motivo
 * obrigatório (≥10 caracteres, exigido pelo backend) e campo extra
 * opcional (dias do trial ou plano da troca).
 * O componente só é montado quando a ação é escolhida, então o estado
 * nasce limpo a cada abertura.
 */
export const AccountActionDialog: React.FC<AccountActionDialogProps> = ({
  open,
  title,
  message,
  extra,
  confirmLabel = 'Confirmar',
  danger = false,
  loading = false,
  error = null,
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState('');
  const [days, setDays] = useState(7);
  const [planId, setPlanId] = useState('');

  const canSubmit = isSubmitAllowed(extra, reason, days, planId);

  const submit = () => {
    if (!canSubmit || loading) return;
    const payload: { days?: number; planId?: string } = {};
    if (extra === 'days') payload.days = days;
    if (extra === 'plans') payload.planId = planId;
    onConfirm(reason.trim(), payload);
  };

  return (
    <ModalShell
      open={open}
      title={title}
      titleId="account-action-dialog-title"
      role="alertdialog"
      loading={loading}
      onClose={onCancel}
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 min-h-11 rounded-xl border border-border font-bold text-text-secondary disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit || loading}
            className={`flex-1 min-h-11 rounded-xl font-bold text-accent-fg disabled:opacity-50 ${
              danger ? 'bg-danger hover:bg-danger/90' : 'bg-accent hover:bg-accent-hover'
            }`}
          >
            {loading ? 'Aguarde…' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-text-secondary">{message}</p>

        {extra === 'days' && (
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-text-primary">Dias de trial (1–90)</span>
            <input
              type="number"
              min={1}
              max={90}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-text-primary"
            />
          </label>
        )}

        {extra === 'plans' && (
          <label className="block text-sm" htmlFor={PLAN_SELECT_ID}>
            <span className="mb-1 block font-medium text-text-primary">Novo plano</span>
            <PlanSelect value={planId} onChange={setPlanId} />
          </label>
        )}

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-text-primary">
            Motivo (mínimo {MIN_REASON} caracteres)
          </span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Por que esta ação está sendo executada?"
            className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-text-primary placeholder:text-text-muted"
          />
          <span className="mt-1 block text-xs text-text-muted">
            {reason.trim().length}/{MIN_REASON} mínimo
          </span>
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </ModalShell>
  );
};
