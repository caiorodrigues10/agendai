import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Edit3, Pause, Play, XCircle, CreditCard, AlertTriangle, RefreshCcw } from 'lucide-react';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { membershipsApi, MembershipPlan, ClientMembership } from '../../infra/membershipsApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { formatCurrencyBRL, formatDateBR } from '../../utils/formatters';
import { Field, FIELD_CONTROL, FORM_FOOTER, FORM_GRID } from '../ui/Field';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';

type Tab = 'plans' | 'memberships';

const CYCLE_LABELS: Record<string, string> = {
  MONTHLY: 'Mensal',
  QUARTERLY: 'Trimestral',
  YEARLY: 'Anual',
};

const MEMBERSHIP_STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-500/10 text-green-400 border-green-500/30',
  PAUSED: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/30',
  PENDING: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
};

const MEMBERSHIP_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativa',
  PAUSED: 'Pausada',
  CANCELLED: 'Cancelada',
  PENDING: 'Pendente',
};

interface PlanFormData {
  name: string;
  description: string;
  price: string;
  billingCycle: string;
  benefits: { serviceId: string; type: string; quantity: string; discountPercent: string; description: string }[];
}

const INITIAL_PLAN_FORM: PlanFormData = {
  name: '',
  description: '',
  price: '',
  billingCycle: 'MONTHLY',
  benefits: [],
};

export const MembershipsPanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();
  const [tab, setTab] = useState<Tab>('plans');
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [memberships, setMemberships] = useState<ClientMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [planForm, setPlanForm] = useState<PlanFormData>(INITIAL_PLAN_FORM);
  const [planSubmitting, setPlanSubmitting] = useState(false);
  const [planSubmitError, setPlanSubmitError] = useState<string | null>(null);

  const [newMembershipOpen, setNewMembershipOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [newMembershipSubmitting, setNewMembershipSubmitting] = useState(false);

  const [actionTarget, setActionTarget] = useState<{ membership: ClientMembership; action: 'activate' | 'pause' | 'resume' | 'cancel' } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [paymentTarget, setPaymentTarget] = useState<{ membership: ClientMembership; cycleId: string } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [paymentLoading, setPaymentLoading] = useState(false);

  const load = useCallback(async () => {
    if (!barbershopId) return;
    setLoading(true);
    setError(null);
    try {
      const [p, m] = await Promise.all([
        membershipsApi.listPlans(barbershopId),
        membershipsApi.listMemberships(barbershopId),
      ]);
      setPlans(p);
      setMemberships(m);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao carregar assinaturas'));
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => { load(); }, [load]);

  const openPlanCreate = () => {
    setEditingPlan(null);
    setPlanForm(INITIAL_PLAN_FORM);
    setPlanSubmitError(null);
    setPlanModalOpen(true);
  };

  const openPlanEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      description: plan.description ?? '',
      price: String(plan.price),
      billingCycle: plan.billingCycle,
      benefits: plan.benefits.map(b => ({
        serviceId: b.serviceId ?? '',
        type: b.type,
        quantity: String(b.quantity),
        discountPercent: String(b.discountPercent ?? ''),
        description: b.description,
      })),
    });
    setPlanSubmitError(null);
    setPlanModalOpen(true);
  };

  const handlePlanSubmit = async () => {
    if (!barbershopId) return;
    setPlanSubmitting(true);
    setPlanSubmitError(null);
    try {
      const payload = {
        name: planForm.name,
        description: planForm.description || undefined,
        price: Number(planForm.price),
        billingCycle: planForm.billingCycle,
        benefits: planForm.benefits.map(b => ({
          serviceId: b.serviceId || undefined,
          type: b.type,
          quantity: Number(b.quantity),
          discountPercent: b.discountPercent ? Number(b.discountPercent) : undefined,
          description: b.description,
        })),
      };
      if (editingPlan) {
        await membershipsApi.updatePlan(barbershopId, editingPlan.id, payload as any);
      } else {
        await membershipsApi.createPlan(barbershopId, payload);
      }
      setPlanModalOpen(false);
      await load();
    } catch (err) {
      setPlanSubmitError(getErrorMessage(err, 'Erro ao salvar plano'));
    } finally {
      setPlanSubmitting(false);
    }
  };

  const handleNewMembership = async () => {
    if (!barbershopId || !selectedPlanId || !selectedClientId) return;
    setNewMembershipSubmitting(true);
    try {
      await membershipsApi.createMembership(barbershopId, { planId: selectedPlanId, clientId: selectedClientId });
      setNewMembershipOpen(false);
      setSelectedPlanId('');
      setSelectedClientId('');
      await load();
    } catch (err) {
      // silent
    } finally {
      setNewMembershipSubmitting(false);
    }
  };

  const handleAction = async () => {
    if (!barbershopId || !actionTarget) return;
    setActionLoading(true);
    try {
      const { membership, action } = actionTarget;
      const apiFn = {
        activate: membershipsApi.activate,
        pause: membershipsApi.pause,
        resume: membershipsApi.resume,
        cancel: membershipsApi.cancel,
      }[action];
      await apiFn(barbershopId, membership.id);
      setActionTarget(null);
      await load();
    } catch (err) {
      setActionTarget(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!barbershopId || !paymentTarget) return;
    setPaymentLoading(true);
    try {
      await membershipsApi.recordPayment(barbershopId, paymentTarget.membership.id, paymentTarget.cycleId, { paymentMethod });
      setPaymentTarget(null);
      await load();
    } catch (err) {
      setPaymentTarget(null);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-xl border border-border p-4 flex items-center justify-center py-8">
        <Loader2 className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 text-danger text-sm">
          <AlertTriangle size={16} />
          <span>{error}</span>
          <button onClick={load} className="ml-auto text-accent text-xs underline">Tentar novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Assinaturas</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('plans')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${tab === 'plans' ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-text-secondary hover:bg-surface'}`}
          >
            Planos ({plans.length})
          </button>
          <button
            onClick={() => setTab('memberships')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${tab === 'memberships' ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-text-secondary hover:bg-surface'}`}
          >
            Adesões ({memberships.length})
          </button>
        </div>
      </div>

      {tab === 'plans' && (
        <>
          <div className="flex justify-end">
            <button onClick={openPlanCreate} className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-bold text-accent-fg">
              <Plus size={14} /> Criar plano
            </button>
          </div>
          {plans.length === 0 ? (
            <EmptyState title="Nenhum plano criado" description="Crie planos de assinatura para oferecer benefícios recorrentes." />
          ) : (
            <div className="space-y-2">
              {plans.map(plan => (
                <div key={plan.id} className="rounded-lg bg-surface-2 p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{plan.name}</p>
                      {plan.description && <p className="text-xs text-text-muted">{plan.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-accent">{formatCurrencyBRL(plan.price)}</span>
                      <span className="text-xs text-text-muted bg-surface rounded-full px-2 py-0.5">
                        {CYCLE_LABELS[plan.billingCycle] ?? plan.billingCycle}
                      </span>
                    </div>
                  </div>
                  {plan.benefits.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {plan.benefits.map(b => (
                        <span key={b.id} className="inline-flex rounded bg-surface px-2 py-0.5 text-[10px] text-text-muted">
                          {b.description}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button onClick={() => openPlanEdit(plan)} className="flex items-center gap-1 rounded-md bg-surface px-2 py-1 text-xs font-medium text-text-secondary hover:bg-surface-2">
                      <Edit3 size={12} /> Editar
                    </button>
                    <span className={`text-xs font-medium ${plan.isActive ? 'text-success' : 'text-text-muted'}`}>
                      {plan.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'memberships' && (
        <>
          <div className="flex justify-end">
            <button onClick={() => setNewMembershipOpen(true)} className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-bold text-accent-fg">
              <Plus size={14} /> Nova adesão
            </button>
          </div>
          {memberships.length === 0 ? (
            <EmptyState title="Nenhuma adesão" description="Associe clientes a planos para gerenciar assinaturas." />
          ) : (
            <div className="space-y-2">
              {memberships.map(m => (
                <div key={m.id} className="rounded-lg bg-surface-2 p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{m.clientName ?? m.clientId}</p>
                      <p className="text-xs text-accent">{m.planName ?? m.planId}</p>
                    </div>
                    <span className={`shrink-0 inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${MEMBERSHIP_STATUS_STYLES[m.status] ?? 'border-border bg-surface text-text-muted'}`}>
                      {MEMBERSHIP_STATUS_LABELS[m.status] ?? m.status}
                    </span>
                  </div>
                  <div className="text-xs text-text-muted">
                    <span>Próximo término: {formatDateBR(m.currentPeriodEnd)}</span>
                  </div>
                  {m.usageSummary.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {m.usageSummary.map(u => (
                        <span key={u.benefitId} className="inline-flex rounded bg-surface px-2 py-0.5 text-[10px] text-text-muted">
                          {u.used}/{u.total} usos
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    {m.status === 'PENDING' && (
                      <button onClick={() => setActionTarget({ membership: m, action: 'activate' })} className="flex items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-xs font-medium text-success hover:bg-success/20">
                        <Play size={12} /> Ativar
                      </button>
                    )}
                    {m.status === 'ACTIVE' && (
                      <button onClick={() => setActionTarget({ membership: m, action: 'pause' })} className="flex items-center gap-1 rounded-md bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-400 hover:bg-yellow-500/20">
                        <Pause size={12} /> Pausar
                      </button>
                    )}
                    {m.status === 'PAUSED' && (
                      <button onClick={() => setActionTarget({ membership: m, action: 'resume' })} className="flex items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-xs font-medium text-success hover:bg-success/20">
                        <RefreshCcw size={12} /> Retomar
                      </button>
                    )}
                    {m.status !== 'CANCELLED' && (
                      <button onClick={() => setActionTarget({ membership: m, action: 'cancel' })} className="flex items-center gap-1 rounded-md bg-danger/10 px-2 py-1 text-xs font-medium text-danger hover:bg-danger/20">
                        <XCircle size={12} /> Cancelar
                      </button>
                    )}
                    {m.cycles.filter(c => c.status !== 'PAID').map(c => (
                      <button
                        key={c.id}
                        onClick={() => setPaymentTarget({ membership: m, cycleId: c.id })}
                        className="flex items-center gap-1 rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent hover:bg-accent/20"
                      >
                        <CreditCard size={12} /> Registrar pagamento
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {planModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold">{editingPlan ? 'Editar plano' : 'Criar plano'}</h4>
              <button onClick={() => setPlanModalOpen(false)} className="text-text-muted hover:text-text-primary">✕</button>
            </div>

            {planSubmitError && <div className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{planSubmitError}</div>}

            <Field label="Nome do plano">
              <input className={FIELD_CONTROL} value={planForm.name} onChange={e => setPlanForm(f => ({ ...f, name: e.target.value }))} />
            </Field>

            <Field label="Descrição">
              <textarea className={FIELD_CONTROL} rows={2} value={planForm.description} onChange={e => setPlanForm(f => ({ ...f, description: e.target.value }))} />
            </Field>

            <div className={FORM_GRID}>
              <Field label="Preço (R$)">
                <input type="number" min={0} step={0.01} className={FIELD_CONTROL} value={planForm.price} onChange={e => setPlanForm(f => ({ ...f, price: e.target.value }))} />
              </Field>
              <Field label="Ciclo">
                <select className={FIELD_CONTROL} value={planForm.billingCycle} onChange={e => setPlanForm(f => ({ ...f, billingCycle: e.target.value }))}>
                  {Object.entries(CYCLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
            </div>

            <div className={FORM_FOOTER}>
              <button onClick={handlePlanSubmit} disabled={planSubmitting || !planForm.name || !planForm.price} className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-accent-fg disabled:opacity-60">
                {planSubmitting ? <Loader2 className="animate-spin" size={16} /> : null}
                {editingPlan ? 'Salvar' : 'Criar'}
              </button>
              <button onClick={() => setPlanModalOpen(false)} className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-2">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {newMembershipOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl border border-border w-full max-w-sm p-5 space-y-4">
            <h4 className="text-base font-bold">Nova adesão</h4>
            <Field label="Plano">
              <select className={FIELD_CONTROL} value={selectedPlanId} onChange={e => setSelectedPlanId(e.target.value)}>
                <option value="">Selecione...</option>
                {plans.filter(p => p.isActive).map(p => <option key={p.id} value={p.id}>{p.name} — {formatCurrencyBRL(p.price)}</option>)}
              </select>
            </Field>
            <Field label="ID do cliente">
              <input className={FIELD_CONTROL} value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} placeholder="UUID do cliente" />
            </Field>
            <div className={FORM_FOOTER}>
              <button onClick={handleNewMembership} disabled={newMembershipSubmitting || !selectedPlanId || !selectedClientId} className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-accent-fg disabled:opacity-60">
                {newMembershipSubmitting ? <Loader2 className="animate-spin" size={16} /> : null}
                Criar adesão
              </button>
              <button onClick={() => setNewMembershipOpen(false)} className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-2">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {actionTarget && (
        <ConfirmDialog
          open
          title={`${actionTarget.action === 'activate' ? 'Ativar' : actionTarget.action === 'pause' ? 'Pausar' : actionTarget.action === 'resume' ? 'Retomar' : 'Cancelar'} assinatura`}
          message={`Deseja ${actionTarget.action === 'activate' ? 'ativar' : actionTarget.action === 'pause' ? 'pausar' : actionTarget.action === 'resume' ? 'retomar' : 'cancelar'} a assinatura de ${actionTarget.membership.clientName ?? actionTarget.membership.clientId}?`}
          confirmLabel="Confirmar"
          variant={actionTarget.action === 'cancel' ? 'danger' : 'default'}
          loading={actionLoading}
          onConfirm={handleAction}
          onCancel={() => setActionTarget(null)}
        />
      )}

      {paymentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl border border-border w-full max-w-sm p-5 space-y-4">
            <h4 className="text-base font-bold">Registrar pagamento</h4>
            <Field label="Método de pagamento">
              <select className={FIELD_CONTROL} value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option value="PIX">PIX</option>
                <option value="CASH">Dinheiro</option>
                <option value="CREDIT_CARD">Cartão de Crédito</option>
                <option value="DEBIT_CARD">Cartão de Débito</option>
              </select>
            </Field>
            <div className={FORM_FOOTER}>
              <button onClick={handlePayment} disabled={paymentLoading} className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-accent-fg disabled:opacity-60">
                {paymentLoading ? <Loader2 className="animate-spin" size={16} /> : <CreditCard size={16} />}
                Confirmar
              </button>
              <button onClick={() => setPaymentTarget(null)} className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-2">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
