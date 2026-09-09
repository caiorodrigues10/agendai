import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Save, Shield, AlertTriangle } from 'lucide-react';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { depositsApi, DepositPolicy } from '../../infra/depositsApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { Field, FIELD_CONTROL, FORM_FOOTER, FORM_GRID } from '../ui/Field';

const DEPOSIT_REQUIRED_OPTIONS = [
  { value: 'OFF', label: 'Desativado' },
  { value: 'OPTIONAL', label: 'Opcional' },
  { value: 'MANDATORY', label: 'Obrigatório' },
];

const REFUND_RULE_OPTIONS = [
  { value: 'FULL_REFUND', label: 'Reembolso integral' },
  { value: 'PARTIAL', label: 'Reembolso parcial' },
  { value: 'CREDIT_ONLY', label: 'Crédito apenas' },
  { value: 'NO_REFUND', label: 'Sem reembolso' },
];

const NO_SHOW_RULE_OPTIONS = [
  { value: 'FORFEIT', label: 'Perder o sinal' },
  { value: 'CREDIT_ONLY', label: 'Converter em crédito' },
  { value: 'CHARGE_DIFFERENCE', label: 'Cobrar diferença' },
];

export const DepositPolicyPanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();
  const [policy, setPolicy] = useState<DepositPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const load = useCallback(async () => {
    if (!barbershopId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await depositsApi.getPolicy(barbershopId);
      setPolicy(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao carregar política de sinal'));
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!barbershopId || !policy) return;
    setSaving(true);
    try {
      await depositsApi.updatePolicy(barbershopId, policy);
      setToast({ msg: 'Política de sinal salva!', type: 'success' });
    } catch (err) {
      setToast({ msg: getErrorMessage(err, 'Erro ao salvar'), type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const update = (partial: Partial<DepositPolicy>) => {
    setPolicy(prev => prev ? { ...prev, ...partial } : prev);
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-xl border border-border p-4 flex items-center justify-center py-8">
        <Loader2 className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  if (error || !policy) {
    return (
      <div className="bg-surface rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 text-danger text-sm">
          <AlertTriangle size={16} />
          <span>{error || 'Não foi possível carregar a política de sinal.'}</span>
          <button onClick={load} className="ml-auto text-accent text-xs underline">Tentar novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-4 space-y-5">
      {toast && (
        <div className={`rounded-lg px-3 py-2 text-sm font-medium ${toast.type === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Shield size={18} className="text-accent" />
        <h3 className="text-lg font-bold">Política de Sinal</h3>
      </div>

      <div className="space-y-4">
        <div className={FORM_GRID}>
          <Field label="Modo do sinal">
            <select
              className={FIELD_CONTROL}
              value={policy.depositRequired}
              onChange={e => update({ depositRequired: e.target.value })}
            >
              {DEPOSIT_REQUIRED_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Percentual padrão (%)" hint="0–100">
            <input
              type="number"
              min={0}
              max={100}
              className={FIELD_CONTROL}
              value={policy.depositDefaultPercent}
              onChange={e => update({ depositDefaultPercent: Number(e.target.value) })}
            />
          </Field>

          <Field label="Valor fixo padrão (R$)" hint="Opcional">
            <input
              type="number"
              min={0}
              step={0.5}
              className={FIELD_CONTROL}
              value={policy.depositDefaultAmount ?? ''}
              onChange={e => update({ depositDefaultAmount: e.target.value ? Number(e.target.value) : undefined })}
            />
          </Field>

          <Field label="Janela de confirmação (horas)">
            <input
              type="number"
              min={1}
              className={FIELD_CONTROL}
              value={policy.depositConfirmHours}
              onChange={e => update({ depositConfirmHours: Number(e.target.value) })}
            />
          </Field>
        </div>

        <Field label="Instruções de pagamento" hint="Exibido ao cliente">
          <textarea
            className={FIELD_CONTROL}
            rows={3}
            value={policy.depositInstructions ?? ''}
            onChange={e => update({ depositInstructions: e.target.value || undefined })}
          />
        </Field>

        <Field label="Chave PIX" hint="Receber pagamentos">
          <input
            className={FIELD_CONTROL}
            value={policy.depositPixKey ?? ''}
            onChange={e => update({ depositPixKey: e.target.value || undefined })}
          />
        </Field>

        <div className={FORM_GRID}>
          <Field label="Regra de reembolso">
            <select
              className={FIELD_CONTROL}
              value={policy.depositRefundRule}
              onChange={e => update({ depositRefundRule: e.target.value })}
            >
              {REFUND_RULE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Regra de sinal no no-show">
            <select
              className={FIELD_CONTROL}
              value={policy.noShowDepositRule}
              onChange={e => update({ noShowDepositRule: e.target.value })}
            >
              {NO_SHOW_RULE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Máx. remarcações">
            <input
              type="number"
              min={0}
              className={FIELD_CONTROL}
              value={policy.maxReschedules}
              onChange={e => update({ maxReschedules: Number(e.target.value) })}
            />
          </Field>

          <Field label="Tolerância atraso (min)">
            <input
              type="number"
              min={0}
              className={FIELD_CONTROL}
              value={policy.lateToleranceMinutes}
              onChange={e => update({ lateToleranceMinutes: Number(e.target.value) })}
            />
          </Field>
        </div>

        <div className="rounded-lg bg-surface-2 p-3 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Regras de risco</p>
          <div className={FORM_GRID}>
            <Field label="Limite de no-shows" hint="Para bloqueio">
              <input
                type="number"
                min={0}
                className={FIELD_CONTROL}
                value={policy.riskThresholdNoShows}
                onChange={e => update({ riskThresholdNoShows: Number(e.target.value) })}
              />
            </Field>

            <Field label="Duração do bloqueio (dias)">
              <input
                type="number"
                min={0}
                className={FIELD_CONTROL}
                value={policy.riskBlockDurationDays}
                onChange={e => update({ riskBlockDurationDays: Number(e.target.value) })}
              />
            </Field>
          </div>

          <label className="flex items-center gap-3 text-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-border accent-accent"
              checked={policy.riskReinforcedDeposit}
              onChange={e => update({ riskReinforcedDeposit: e.target.checked })}
            />
            Sinal reforçado para clientes de risco
          </label>

          <label className="flex items-center gap-3 text-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-border accent-accent"
              checked={policy.riskManualApproval}
              onChange={e => update({ riskManualApproval: e.target.checked })}
            />
            Aprovação manual para clientes de risco
          </label>
        </div>

        <label className="flex items-center gap-3 text-sm text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-border accent-accent"
            checked={policy.rescheduleTransferDeposit}
            onChange={e => update({ rescheduleTransferDeposit: e.target.checked })}
          />
          Transferir sinal ao remarcar
        </label>
      </div>

      <div className={FORM_FOOTER}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-accent-fg disabled:opacity-60"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Salvar
        </button>
      </div>
    </div>
  );
};
