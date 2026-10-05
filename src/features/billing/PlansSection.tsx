import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { adminApi, PlanItem } from '../../infra/adminApi';
import { SmartSelect } from '../../components/ui/SmartSelect';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Toast } from '../../components/ui/Toast';
import { brl, errorMessage, SectionError } from './billingShared';
import { DataTableState } from '../../components/patterns';
import {
  LuPlus as Plus,
  LuPencil as Pencil,
  LuTrash2 as Trash2,
  LuCircleCheck as CheckCircle2,
  LuCircleX as XCircle,
  LuBan as Ban,
} from 'react-icons/lu';

// ─────────────────────────────────────────────
// Seção: Planos
// ─────────────────────────────────────────────

interface PlanFormModalProps {
  plan: PlanItem | null;
  onClose: () => void;
  onSaved: () => void;
}

const PlanFormModal: React.FC<PlanFormModalProps> = ({ plan, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name: plan?.name ?? '',
    description: plan?.description ?? '',
    price: plan ? String(plan.price) : '',
    billingCycle: (plan?.billingCycle ?? 'MONTHLY') as 'MONTHLY' | 'YEARLY',
    maxEmployees: plan ? String(plan.maxEmployees) : '0',
    hasDashboard: plan?.hasDashboard ?? true,
    tierKey: plan?.tierKey ?? 'pro',
    features: plan?.features.join('\n') ?? '',
    active: plan?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(form.price.replace(',', '.'));
    const maxEmployees = Number(form.maxEmployees);
    const features = form.features
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean);

    if (!price || price <= 0) {
      setError('Informe um preço válido.');
      return;
    }
    if (Number.isNaN(maxEmployees) || maxEmployees < 0) {
      setError('Máx. funcionários: 0 = ilimitado.');
      return;
    }
    if (features.length === 0) {
      setError('Informe ao menos uma feature (uma por linha).');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (plan) {
        await adminApi.updatePlan(plan.id, {
          name: form.name,
          description: form.description || undefined,
          price,
          billingCycle: form.billingCycle,
          maxEmployees,
          hasDashboard: form.hasDashboard,
          tierKey: form.tierKey,
          features,
          active: form.active,
        });
      } else {
        await adminApi.createPlan({
          name: form.name,
          description: form.description || undefined,
          price,
          billingCycle: form.billingCycle,
          maxEmployees,
          hasDashboard: form.hasDashboard,
          tierKey: form.tierKey,
          features,
        });
      }
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="text-xl font-bold text-text-primary tracking-tight">
            {plan ? 'Editar Plano' : 'Novo Plano'}
          </h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-danger/5 border border-danger/20 rounded-xl px-4 py-2.5 text-xs text-danger">
              {error}
            </div>
          )}
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
              Nome
            </label>
            <input
              type="text"
              required
              minLength={2}
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-bg border border-border text-text-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-focus transition-all"
              placeholder="Ex: Plano Pro"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
              Descrição
            </label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full bg-bg border border-border text-text-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-focus transition-all"
              placeholder="Descrição curta do plano"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
                Preço ({form.billingCycle === 'YEARLY' ? 'anual' : 'mensal'}) (R$)
              </label>
              <input
                type="text"
                required
                inputMode="decimal"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                className="w-full bg-bg border border-border text-text-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-focus transition-all"
                placeholder="99.90"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
                Ciclo
              </label>
              <SmartSelect
                mode="single"
                options={[{ value: 'MONTHLY', label: 'Mensal' }, { value: 'YEARLY', label: 'Anual' }]}
                value={form.billingCycle}
                onChange={value => setForm({ ...form, billingCycle: (value ?? 'MONTHLY') as 'MONTHLY' | 'YEARLY' })}
                searchable={false}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
              Máx. funcionários (0 = ilimitado)
            </label>
            <input
              type="number"
              required
              min={0}
              value={form.maxEmployees}
              onChange={e => setForm({ ...form, maxEmployees: e.target.value })}
              className="w-full bg-bg border border-border text-text-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-focus transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
                Tier
              </label>
              <SmartSelect
                value={form.tierKey}
                onChange={val => setForm({ ...form, tierKey: val ?? 'pro' })}
                options={[
                  { value: 'essential', label: 'essential' },
                  { value: 'pro', label: 'pro' },
                ]}
                placeholder="Tier"
                clearable={false}
                size="sm"
                aria-label="Tier do plano"
              />
            </div>
            <div className="flex items-end pb-1">
              <button
                type="button"
                onClick={() => setForm({ ...form, hasDashboard: !form.hasDashboard })}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                  form.hasDashboard
                    ? 'bg-success/10 text-success border-success/20'
                    : 'bg-surface-2 text-text-muted border-border'
                }`}
              >
                {form.hasDashboard ? 'Com dashboard' : 'Sem dashboard'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
              Features (uma por linha)
            </label>
            <textarea
              required
              rows={4}
              value={form.features}
              onChange={e => setForm({ ...form, features: e.target.value })}
              className="w-full bg-bg border border-border text-text-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-focus transition-all resize-none"
              placeholder={'Fila digital\nAgendamentos ilimitados\nRelatórios'}
            />
          </div>
          {plan && (
            <button
              type="button"
              onClick={() => setForm({ ...form, active: !form.active })}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                form.active
                  ? 'bg-success/10 text-success border-success/20'
                  : 'bg-danger/10 text-danger border-danger/20'
              }`}
            >
              {form.active ? <CheckCircle2 size={16} /> : <Ban size={16} />}
              {form.active ? 'Plano ativo' : 'Plano inativo'}
            </button>
          )}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded-xl text-sm font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-accent text-accent-fg rounded-xl text-sm font-bold hover:bg-accent-hover transition-all disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export const PlansSection: React.FC = () => {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<PlanItem | null>(null);
  const [deactivating, setDeactivating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'bot' } | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listPlans(true);
      setPlans(res.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleDeactivate = async (plan: PlanItem) => {
    setDeactivating(true);
    try {
      const res = await adminApi.deactivatePlan(plan.id);
      if (res.data?.info) setToast({ message: res.data.info, type: 'success' });
      fetchPlans();
    } catch (err) {
      setToast({ message: errorMessage(err), type: 'error' });
    } finally {
      setDeactivating(false);
      setConfirmDeactivate(null);
    }
  };

  if (error) return <SectionError message={error} onRetry={fetchPlans} />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setSelectedPlan(null);
            setModalOpen(true);
          }}
          className="bg-accent hover:bg-accent-hover text-black px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={16} />
          Novo Plano
        </button>
      </div>

      {loading || plans.length === 0 ? (
        <DataTableState
          loading={loading}
          isEmpty={!loading}
          emptyTitle="Nenhum plano cadastrado."
          skeleton={
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-52 bg-surface-2/40 rounded-2xl animate-pulse" />
              ))}
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`bg-surface border rounded-2xl p-5 flex flex-col gap-3 transition-colors ${
                plan.active
                  ? 'border-border hover:border-border-strong'
                  : 'border-border opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-text-primary truncate">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
                      {plan.description}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                    plan.active
                      ? 'bg-success/10 text-success border-success/20'
                      : 'bg-surface-2 text-text-muted border-border-strong'
                  }`}
                >
                  {plan.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div>
                <span className="text-2xl font-black text-text-primary tracking-tighter">
                  {brl.format(plan.price)}
                </span>
                <span className="text-xs text-text-muted">
                  /{plan.billingCycle === 'YEARLY' ? 'ano' : 'mês'}
                </span>
              </div>
              <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold">
                {plan.maxEmployees === 0
                  ? 'Funcionários ilimitados'
                  : `Até ${plan.maxEmployees} funcionário${plan.maxEmployees !== 1 ? 's' : ''}`}
                {' · '}
                {plan.hasDashboard === false ? 'Sem dashboard' : 'Com dashboard'}
              </p>
              <ul className="space-y-1.5 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                    <CheckCircle2 size={12} className="text-accent shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setSelectedPlan(plan);
                    setModalOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-border rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all"
                >
                  <Pencil size={12} />
                  Editar
                </button>
                {plan.active && (
                  <button
                    onClick={() => setConfirmDeactivate(plan)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 border border-danger/20 rounded-xl text-xs font-bold text-danger hover:bg-danger/10 transition-all"
                  >
                    <Trash2 size={12} />
                    Desativar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <PlanFormModal
          plan={selectedPlan}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            fetchPlans();
          }}
        />
      )}
      <ConfirmDialog
        open={confirmDeactivate !== null}
        title="Desativar plano"
        message={`Desativar o plano "${confirmDeactivate?.name ?? ''}"? Salões que já assinam continuam até o vencimento.`}
        confirmLabel="Desativar"
        variant="danger"
        loading={deactivating}
        onConfirm={() => confirmDeactivate && void handleDeactivate(confirmDeactivate)}
        onCancel={() => setConfirmDeactivate(null)}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
