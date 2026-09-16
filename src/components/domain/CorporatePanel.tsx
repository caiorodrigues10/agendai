import React, { useEffect, useState } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  Loader2,
  CreditCard,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { corporateApi, CorporatePlan, CorporateSubscription } from '../../infra/corporateApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { SmartSelect } from '../ui/SmartSelect';

export const CorporatePanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();
  const [plans, setPlans] = useState<CorporatePlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<CorporateSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'plans' | 'subscriptions'>('plans');

  // Create plan form
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState(0);
  const [newMaxUnits, setNewMaxUnits] = useState(10);
  const [newFeatures, setNewFeatures] = useState('');

  // Subscribe form
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subPlanId, setSubPlanId] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      corporateApi.listPlans(),
      corporateApi.listSubscriptions(barbershopId ? { barbershopId } : undefined),
    ])
      .then(([p, s]) => { setPlans(p); setSubscriptions(s); })
      .catch(err => setError(getErrorMessage(err, 'Erro ao carregar dados corporativos.')))
      .finally(() => setLoading(false));
  }, [barbershopId]);

  const handleCreatePlan = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setError('');
    try {
      const plan = await corporateApi.createPlan({
        name: newName.trim(),
        description: newDescription.trim(),
        price: newPrice,
        maxUnits: newMaxUnits,
        features: newFeatures.split(',').map(f => f.trim()).filter(Boolean),
      });
      setPlans(prev => [...prev, plan]);
      setShowCreate(false);
      setNewName('');
      setNewDescription('');
      setNewPrice(0);
      setNewMaxUnits(10);
      setNewFeatures('');
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao criar plano.'));
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await corporateApi.deletePlan(planId);
      setPlans(prev => prev.filter(p => p.id !== planId));
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao remover plano.'));
    }
  };

  const handleSubscribe = async () => {
    if (!barbershopId || !subPlanId) return;
    setSubscribing(true);
    setError('');
    try {
      const sub = await corporateApi.subscribe({ planId: subPlanId, barbershopId });
      setSubscriptions(prev => [sub, ...prev]);
      setShowSubscribe(false);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao assinar.'));
    } finally {
      setSubscribing(false);
    }
  };

  const handleValidate = async (subId: string) => {
    try {
      const updated = await corporateApi.validate(subId);
      setSubscriptions(prev => prev.map(s => s.id === subId ? updated : s));
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao validar assinatura.'));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-text-primary">Corporativo</h3>
        <div className="flex gap-2">
          {tab === 'plans' && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg"
            >
              <Plus size={16} /> Plano
            </button>
          )}
          {tab === 'subscriptions' && barbershopId && (
            <button
              onClick={() => setShowSubscribe(!showSubscribe)}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg"
            >
              <CreditCard size={16} /> Assinar
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-error">{error}</p>}

      <div className="flex gap-2 overflow-x-auto">
        {(['plans', 'subscriptions'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap ${
              tab === t ? 'bg-accent text-accent-fg' : 'bg-surface text-text-secondary hover:bg-surface-2'
            }`}
          >
            {t === 'plans' ? 'Planos' : 'Assinaturas'}
          </button>
        ))}
      </div>

      {tab === 'plans' && showCreate && (
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
          <input
            type="text"
            placeholder="Nome do plano"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
          <textarea
            placeholder="Descrição"
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none resize-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted">Preço (R$)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={newPrice || ''}
                onChange={e => setNewPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted">Máx. unidades</label>
              <input
                type="number"
                min={1}
                value={newMaxUnits}
                onChange={e => setNewMaxUnits(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              />
            </div>
          </div>
          <input
            type="text"
            placeholder="Features (separadas por vírgula)"
            value={newFeatures}
            onChange={e => setNewFeatures(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => void handleCreatePlan()}
              disabled={creating || !newName.trim()}
              className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg disabled:opacity-50"
            >
              {creating ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
              Criar
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-surface-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {tab === 'subscriptions' && showSubscribe && (
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
          <SmartSelect
            value={subPlanId || null}
            onChange={val => setSubPlanId(val ?? '')}
            options={plans.filter(p => p.active).map(p => ({
              value: p.id,
              label: `${p.name} - R$ ${p.price.toFixed(2)}`,
            }))}
            placeholder="Selecionar plano"
          />
          <div className="flex gap-2">
            <button
              onClick={() => void handleSubscribe()}
              disabled={subscribing || !subPlanId}
              className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg disabled:opacity-50"
            >
              {subscribing ? <Loader2 className="animate-spin" size={14} /> : <CreditCard size={14} />}
              Assinar
            </button>
            <button
              onClick={() => setShowSubscribe(false)}
              className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-surface-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {tab === 'plans' && (
        plans.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <Building2 size={32} className="mx-auto text-text-muted" />
            <p className="mt-2 text-sm text-text-secondary">Nenhum plano corporativo.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {plans.map(plan => (
              <div key={plan.id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-text-primary">{plan.name}</p>
                    <p className="text-xs text-text-secondary">{plan.description}</p>
                    <p className="text-xs text-text-muted">
                      R$ {plan.price.toFixed(2)} · Max {plan.maxUnits} unidades
                    </p>
                    {plan.features.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {plan.features.map((f, i) => (
                          <span key={i} className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] text-text-muted">
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${plan.active ? 'bg-success/15 text-success' : 'bg-surface-2 text-text-muted'}`}>
                      {plan.active ? 'Ativo' : 'Inativo'}
                    </span>
                    <button
                      onClick={() => void handleDeletePlan(plan.id)}
                      className="rounded-lg p-2 text-text-muted hover:bg-error/10 hover:text-error"
                      title="Remover"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'subscriptions' && (
        subscriptions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <CreditCard size={32} className="mx-auto text-text-muted" />
            <p className="mt-2 text-sm text-text-secondary">Nenhuma assinatura.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {subscriptions.map(sub => (
              <div key={sub.id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-text-primary">{sub.planName}</p>
                    <p className="text-xs text-text-muted">
                      {sub.barbershopName} · {new Date(sub.startsAt).toLocaleDateString('pt-BR')} → {new Date(sub.expiresAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      sub.status === 'ACTIVE' ? 'bg-success/15 text-success' :
                      sub.status === 'EXPIRED' ? 'bg-error/15 text-error' :
                      'bg-surface-2 text-text-muted'
                    }`}>
                      {sub.status}
                    </span>
                    {sub.status !== 'ACTIVE' && (
                      <button
                        onClick={() => void handleValidate(sub.id)}
                        className="flex items-center gap-1 rounded-lg bg-success/10 px-2 py-1 text-[10px] font-bold text-success hover:bg-success/20"
                      >
                        <CheckCircle2 size={10} /> Validar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
