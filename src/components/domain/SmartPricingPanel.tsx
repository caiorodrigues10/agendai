import React, { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  Loader2,
  Trash2,
  Zap,
  ToggleLeft,
  ToggleRight,
  Check,
  X,
  Calculator,
  Tag,
} from 'lucide-react';
import { pricingApi, PricingRule, PricingCondition, PriceEvaluation } from '../../infra/pricingApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { useBarbershop } from '../../contexts/BarbershopContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { Field, FIELD_CONTROL, FORM_FOOTER } from '../ui/Field';
import { SmartSelect } from '../ui/SmartSelect';

const RULE_TYPES = ['TIME_BASED', 'VOLUME', 'LOYALTY', 'PROMOTIONAL', 'HAPPY_HOUR'];
const DISCOUNT_TYPES = ['PERCENTAGE', 'FIXED'];
const CONDITIONS = [
  { field: 'dayOfWeek', label: 'Dia da semana' },
  { field: 'timeRange', label: 'Horário' },
  { field: 'serviceId', label: 'Serviço' },
  { field: 'clientVisits', label: 'Nº de visitas' },
];

const RULE_TYPE_LABELS: Record<string, string> = {
  TIME_BASED: 'Horário',
  VOLUME: 'Volume',
  LOYALTY: 'Fidelidade',
  PROMOTIONAL: 'Promocional',
  HAPPY_HOUR: 'Happy Hour',
};

const STATUS_COLORS: Record<string, string> = {
  PERCENTAGE: 'bg-accent/15 text-accent',
  FIXED: 'bg-success/15 text-success',
};

interface RuleForm {
  name: string;
  type: string;
  priority: string;
  conditions: PricingCondition[];
  discountType: string;
  discountValue: string;
  maxDiscount: string;
  validFrom: string;
  validUntil: string;
}

const INITIAL_FORM: RuleForm = {
  name: '',
  type: 'PROMOTIONAL',
  priority: '10',
  conditions: [],
  discountType: 'PERCENTAGE',
  discountValue: '',
  maxDiscount: '',
  validFrom: '',
  validUntil: '',
};

export const SmartPricingPanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();
  const { services, staff } = useBarbershop();

  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create/edit
  const [showForm, setShowForm] = useState(false);
  const [editRule, setEditRule] = useState<PricingRule | null>(null);
  const [form, setForm] = useState<RuleForm>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  // Evaluation demo
  const [showEval, setShowEval] = useState(false);
  const [evalServiceId, setEvalServiceId] = useState('');
  const [evalStaffId, setEvalStaffId] = useState('');
  const [evalDate, setEvalDate] = useState('');
  const [evalTime, setEvalTime] = useState('');
  const [evalResult, setEvalResult] = useState<PriceEvaluation | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  const loadRules = useCallback(async () => {
    if (!barbershopId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await pricingApi.list(barbershopId);
      setRules(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const handleOpenCreate = () => {
    setEditRule(null);
    setForm(INITIAL_FORM);
    setShowForm(true);
  };

  const handleOpenEdit = (rule: PricingRule) => {
    setEditRule(rule);
    setForm({
      name: rule.name,
      type: rule.type,
      priority: String(rule.priority),
      conditions: [...rule.conditions],
      discountType: rule.discountType,
      discountValue: String(rule.discountValue),
      maxDiscount: rule.maxDiscount ? String(rule.maxDiscount) : '',
      validFrom: rule.validFrom ? rule.validFrom.slice(0, 10) : '',
      validUntil: rule.validUntil ? rule.validUntil.slice(0, 10) : '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!barbershopId || !form.name.trim() || !form.discountValue) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        priority: parseInt(form.priority, 10) || 10,
        conditions: form.conditions,
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : undefined,
        validFrom: form.validFrom || undefined,
        validUntil: form.validUntil || undefined,
      };

      if (editRule) {
        const updated = await pricingApi.update(barbershopId, editRule.id, payload);
        setRules(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      } else {
        const created = await pricingApi.create(barbershopId, payload);
        setRules(prev => [created, ...prev]);
      }
      setShowForm(false);
      setEditRule(null);
      setForm(INITIAL_FORM);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (rule: PricingRule) => {
    if (!barbershopId) return;
    try {
      const updated = await pricingApi.toggle(barbershopId, rule.id);
      setRules(prev => prev.map(r => (r.id === rule.id ? updated : r)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!barbershopId) return;
    try {
      await pricingApi.remove(barbershopId, ruleId);
      setRules(prev => prev.filter(r => r.id !== ruleId));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleAddCondition = () => {
    setForm(f => ({
      ...f,
      conditions: [...f.conditions, { field: 'dayOfWeek', operator: 'eq', value: '' }],
    }));
  };

  const handleUpdateCondition = (idx: number, data: Partial<PricingCondition>) => {
    setForm(f => ({
      ...f,
      conditions: f.conditions.map((c, i) => (i === idx ? { ...c, ...data } : c)),
    }));
  };

  const handleRemoveCondition = (idx: number) => {
    setForm(f => ({
      ...f,
      conditions: f.conditions.filter((_, i) => i !== idx),
    }));
  };

  const handleEvaluate = async () => {
    if (!barbershopId || !evalServiceId) return;
    setEvaluating(true);
    setError(null);
    setEvalResult(null);
    try {
      const result = await pricingApi.evaluate(barbershopId, {
        serviceId: evalServiceId,
        staffId: evalStaffId || undefined,
        appointmentDate: evalDate || undefined,
        appointmentTime: evalTime || undefined,
      });
      setEvalResult(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setEvaluating(false);
    }
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

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
        <h3 className="text-lg font-bold text-text-primary">Smart Pricing</h3>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowEval(!showEval); setShowForm(false); }}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-surface-2"
          >
            <Calculator size={14} />
            Simular
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg"
          >
            <Plus size={16} />
            Criar regra
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-error">{error}</p>}

      {/* Evaluation demo */}
      {showEval && (
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
          <h4 className="text-xs font-bold text-text-secondary">Simular precificação</h4>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Serviço *">
              <SmartSelect
                value={evalServiceId || null}
                onChange={val => setEvalServiceId(val ?? '')}
                options={services.map(s => ({ value: s.id, label: s.name }))}
                placeholder="Selecione..."
                size="sm"
                aria-label="Serviço"
              />
            </Field>
            <Field label="Profissional">
              <SmartSelect
                value={evalStaffId || null}
                onChange={val => setEvalStaffId(val ?? '')}
                options={staff.map(s => ({ value: s.id, label: s.name }))}
                placeholder="Qualquer"
                size="sm"
                aria-label="Profissional"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Data">
              <input
                type="date"
                value={evalDate}
                onChange={e => setEvalDate(e.target.value)}
                className={FIELD_CONTROL}
              />
            </Field>
            <Field label="Horário">
              <input
                type="time"
                value={evalTime}
                onChange={e => setEvalTime(e.target.value)}
                className={FIELD_CONTROL}
              />
            </Field>
          </div>
          <div className={FORM_FOOTER}>
            <button
              onClick={() => void handleEvaluate()}
              disabled={evaluating || !evalServiceId}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg disabled:opacity-50"
            >
              {evaluating ? <Loader2 className="animate-spin" size={14} /> : <Calculator size={14} />}
              Avaliar preço
            </button>
          </div>

          {evalResult && (
            <div className="rounded-xl border border-border bg-bg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Preço base:</span>
                <span className="font-bold text-text-primary">{fmt(evalResult.basePrice)}</span>
              </div>
              {evalResult.appliedRules.map((r, i) => (
                <div key={i} className="flex justify-between text-xs text-text-muted">
                  <span>{r.ruleName}</span>
                  <span className="text-success">-{fmt(r.discount)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 flex justify-between text-sm">
                <span className="font-bold text-text-primary">Preço final:</span>
                <span className="font-bold text-accent text-lg">{fmt(evalResult.finalPrice)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/edit form */}
      {showForm && (
        <div className="rounded-2xl border border-accent bg-surface p-4 space-y-3">
          <h4 className="text-xs font-bold text-text-secondary">
            {editRule ? 'Editar regra' : 'Nova regra de precificação'}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nome *">
              <input
                type="text"
                placeholder="Ex: Happy Hour"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className={FIELD_CONTROL}
              />
            </Field>
            <Field label="Tipo">
              <SmartSelect
                value={form.type}
                onChange={val => setForm(f => ({ ...f, type: val ?? 'PROMOTIONAL' }))}
                options={RULE_TYPES.map(t => ({ value: t, label: RULE_TYPE_LABELS[t] }))}
                placeholder="Tipo da regra"
                clearable={false}
                size="sm"
                aria-label="Tipo da regra"
              />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Prioridade">
              <input
                type="number"
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                className={FIELD_CONTROL}
              />
            </Field>
            <Field label="Tipo de desconto">
              <SmartSelect
                value={form.discountType}
                onChange={val => setForm(f => ({ ...f, discountType: val ?? 'PERCENTAGE' }))}
                options={DISCOUNT_TYPES.map(t => ({ value: t, label: t === 'PERCENTAGE' ? 'Percentual' : 'Fixo' }))}
                placeholder="Tipo de desconto"
                clearable={false}
                size="sm"
                aria-label="Tipo de desconto"
              />
            </Field>
            <Field label={form.discountType === 'PERCENTAGE' ? 'Desconto (%) *' : 'Desconto (R$) *'}>
              <input
                type="number"
                placeholder="0"
                value={form.discountValue}
                onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                className={FIELD_CONTROL}
                min="0"
                step="0.01"
              />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Desconto máx. (opcional)">
              <input
                type="number"
                placeholder="R$"
                value={form.maxDiscount}
                onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))}
                className={FIELD_CONTROL}
                min="0"
                step="0.01"
              />
            </Field>
            <Field label="Válido de">
              <input
                type="date"
                value={form.validFrom}
                onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))}
                className={FIELD_CONTROL}
              />
            </Field>
            <Field label="Válido até">
              <input
                type="date"
                value={form.validUntil}
                onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))}
                className={FIELD_CONTROL}
              />
            </Field>
          </div>

          {/* Conditions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-text-secondary">Condições</span>
              <button
                onClick={handleAddCondition}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-accent hover:underline"
              >
                <Plus size={10} /> Adicionar
              </button>
            </div>
            {form.conditions.length === 0 && (
              <p className="text-xs text-text-muted">Sem condições — aplica a todos.</p>
            )}
            <div className="space-y-2">
              {form.conditions.map((cond, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <SmartSelect
                    value={cond.field}
                    onChange={val => handleUpdateCondition(idx, { field: val ?? 'dayOfWeek' })}
                    options={CONDITIONS.map(c => ({ value: c.field, label: c.label }))}
                    clearable={false}
                    size="sm"
                    aria-label="Campo da condição"
                  />
                  <SmartSelect
                    value={cond.operator}
                    onChange={val => handleUpdateCondition(idx, { operator: val ?? 'eq' })}
                    options={[
                      { value: 'eq', label: 'igual' },
                      { value: 'neq', label: 'diferente' },
                      { value: 'gte', label: 'maior ou igual' },
                      { value: 'lte', label: 'menor ou igual' },
                      { value: 'contains', label: 'contém' },
                    ]}
                    clearable={false}
                    size="sm"
                    aria-label="Operador da condição"
                  />
                  <input
                    type="text"
                    placeholder="Valor"
                    value={cond.value}
                    onChange={e => handleUpdateCondition(idx, { value: e.target.value })}
                    className="flex-1 rounded-lg border border-border bg-bg px-2 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                  />
                  <button
                    onClick={() => handleRemoveCondition(idx)}
                    className="rounded p-1 text-text-muted hover:bg-error/10 hover:text-error"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={FORM_FOOTER}>
            <button
              onClick={() => void handleSave()}
              disabled={saving || !form.name.trim() || !form.discountValue}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
              {editRule ? 'Salvar' : 'Criar'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditRule(null); }}
              className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-surface-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Rules list */}
      {rules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <Tag size={32} className="mx-auto text-text-muted" />
          <p className="mt-2 text-sm text-text-secondary">Nenhuma regra de precificação.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map(rule => (
            <div
              key={rule.id}
              className={`flex items-center gap-3 rounded-2xl border bg-surface p-3 transition-colors ${
                rule.isActive ? 'border-border' : 'border-border opacity-60'
              }`}
            >
              <button
                onClick={() => void handleToggle(rule)}
                className="shrink-0"
              >
                {rule.isActive ? (
                  <ToggleRight size={24} className="text-accent" />
                ) : (
                  <ToggleLeft size={24} className="text-text-muted" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-text-primary">{rule.name}</p>
                <p className="text-xs text-text-muted">
                  {RULE_TYPE_LABELS[rule.type] || rule.type}
                  {' · '}
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${STATUS_COLORS[rule.discountType] || ''}`}>
                    {rule.discountType === 'PERCENTAGE' ? `${rule.discountValue}%` : fmt(rule.discountValue)}
                  </span>
                  {rule.maxDiscount && ` (máx ${fmt(rule.maxDiscount)})`}
                  {` · Prioridade ${rule.priority}`}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(rule)}
                  className="rounded-lg px-2 py-1 text-[10px] font-bold text-text-secondary hover:bg-surface-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => void handleDelete(rule.id)}
                  className="rounded-lg p-2 text-text-muted hover:bg-error/10 hover:text-error"
                  title="Remover"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
