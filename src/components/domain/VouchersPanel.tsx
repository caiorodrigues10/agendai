import React, { useCallback, useEffect, useState } from 'react';
import {
  LuPlus as Plus,
  LuLoaderCircle as Loader2,
  LuTrash2 as Trash2,
  LuTag as Tag,
  LuCheck as Check,
  LuX as X,
  LuSearch as Search,
  LuTicket as Ticket,
} from 'react-icons/lu';
import { vouchersApi, Voucher, VoucherUsage } from '../../infra/vouchersApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { useBarbershop } from '../../contexts/BarbershopContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { Field, FIELD_CONTROL, FORM_FOOTER } from '../ui/Field';
import { SmartSelect } from '../ui/SmartSelect';

const VOUCHER_TYPES = ['PERCENTAGE', 'FIXED', 'FREE_SERVICE'];

const TYPE_LABELS: Record<string, string> = {
  PERCENTAGE: 'Percentual',
  FIXED: 'Valor fixo',
  FREE_SERVICE: 'Serviço grátis',
};

const voucherTypeOptions = VOUCHER_TYPES.map(value => ({ value, label: TYPE_LABELS[value] }));

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-success/15 text-success',
  INACTIVE: 'bg-surface-2 text-text-muted',
  EXPIRED: 'bg-error/15 text-error',
};

interface VoucherForm {
  name: string;
  description: string;
  code: string;
  type: string;
  value: string;
  minPurchase: string;
  maxUses: string;
  perClientLimit: string;
  validFrom: string;
  validUntil: string;
}

const INITIAL_FORM: VoucherForm = {
  name: '',
  description: '',
  code: '',
  type: 'PERCENTAGE',
  value: '',
  minPurchase: '',
  maxUses: '',
  perClientLimit: '',
  validFrom: '',
  validUntil: '',
};

export const VouchersPanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();
  const { services } = useBarbershop();

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create/edit
  const [showForm, setShowForm] = useState(false);
  const [editVoucher, setEditVoucher] = useState<Voucher | null>(null);
  const [form, setForm] = useState<VoucherForm>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  // Validation demo
  const [showValidation, setShowValidation] = useState(false);
  const [validateCode, setValidateCode] = useState('');
  const [validateServiceId, setValidateServiceId] = useState('');
  const [validatePurchaseAmount, setValidatePurchaseAmount] = useState('');
  const [validateResult, setValidateResult] = useState<{ valid: boolean; discount: number; message?: string } | null>(null);
  const [validating, setValidating] = useState(false);

  // Detail & usages
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [usages, setUsages] = useState<VoucherUsage[]>([]);
  const [usagesLoading, setUsagesLoading] = useState(false);

  const loadVouchers = useCallback(async () => {
    if (!barbershopId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await vouchersApi.list(barbershopId);
      setVouchers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    loadVouchers();
  }, [loadVouchers]);

  const handleOpenCreate = () => {
    setEditVoucher(null);
    setForm(INITIAL_FORM);
    setShowForm(true);
  };

  const handleOpenEdit = (voucher: Voucher) => {
    setEditVoucher(voucher);
    setForm({
      name: voucher.name,
      description: voucher.description || '',
      code: voucher.code,
      type: voucher.type,
      value: String(voucher.value),
      minPurchase: voucher.minPurchase ? String(voucher.minPurchase) : '',
      maxUses: voucher.maxUses ? String(voucher.maxUses) : '',
      perClientLimit: voucher.perClientLimit ? String(voucher.perClientLimit) : '',
      validFrom: voucher.validFrom ? voucher.validFrom.slice(0, 10) : '',
      validUntil: voucher.validUntil ? voucher.validUntil.slice(0, 10) : '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!barbershopId || !form.name.trim() || !form.value || !form.validUntil) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        code: form.code.trim() || undefined,
        type: form.type,
        value: parseFloat(form.value),
        minPurchase: form.minPurchase ? parseFloat(form.minPurchase) : undefined,
        maxUses: form.maxUses ? parseInt(form.maxUses, 10) : undefined,
        perClientLimit: form.perClientLimit ? parseInt(form.perClientLimit, 10) : undefined,
        validFrom: form.validFrom || undefined,
        validUntil: new Date(form.validUntil).toISOString(),
      };

      if (editVoucher) {
        const updated = await vouchersApi.update(barbershopId, editVoucher.id, payload);
        setVouchers(prev => prev.map(v => (v.id === updated.id ? updated : v)));
      } else {
        const created = await vouchersApi.create(barbershopId, payload);
        setVouchers(prev => [created, ...prev]);
      }
      setShowForm(false);
      setEditVoucher(null);
      setForm(INITIAL_FORM);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (voucherId: string) => {
    if (!barbershopId) return;
    try {
      await vouchersApi.remove(barbershopId, voucherId);
      setVouchers(prev => prev.filter(v => v.id !== voucherId));
      if (selectedVoucher?.id === voucherId) setSelectedVoucher(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleValidate = async () => {
    if (!barbershopId || !validateCode.trim()) return;
    setValidating(true);
    setError(null);
    setValidateResult(null);
    try {
      const result = await vouchersApi.validate(barbershopId, validateCode.trim(), {
        serviceId: validateServiceId || undefined,
        purchaseAmount: validatePurchaseAmount ? parseFloat(validatePurchaseAmount) : undefined,
      });
      setValidateResult(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setValidating(false);
    }
  };

  const handleSelectVoucher = async (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setUsagesLoading(true);
    try {
      const data = await vouchersApi.listUsages(barbershopId!, voucher.id);
      setUsages(data);
    } catch {
      setUsages([]);
    } finally {
      setUsagesLoading(false);
    }
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('pt-BR') : '-';

  const serviceOptions = [
    { value: 'ANY', label: 'Qualquer' },
    ...services.map(service => ({ value: service.id, label: service.name })),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-text-primary">Vouchers</h3>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowValidation(!showValidation); setShowForm(false); }}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-surface-2"
          >
            <Search size={14} />
            Validar
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg"
          >
            <Plus size={16} />
            Criar voucher
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-error">{error}</p>}

      {/* Validation demo */}
      {showValidation && (
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
          <h4 className="text-xs font-bold text-text-secondary">Validar voucher</h4>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Código *">
              <input
                type="text"
                placeholder="Código do voucher"
                value={validateCode}
                onChange={e => setValidateCode(e.target.value.toUpperCase())}
                className={FIELD_CONTROL}
              />
            </Field>
            <Field label="Serviço">
              <SmartSelect
                value={validateServiceId || 'ANY'}
                onChange={value => setValidateServiceId(value === 'ANY' || !value ? '' : value)}
                options={serviceOptions}
                clearable={false}
                searchable
                placeholder="Buscar serviço"
              />
            </Field>
          </div>
          <Field label="Valor da compra (R$)">
            <input
              type="number"
              placeholder="0.00"
              value={validatePurchaseAmount}
              onChange={e => setValidatePurchaseAmount(e.target.value)}
              className={FIELD_CONTROL}
              min="0"
              step="0.01"
            />
          </Field>
          <div className={FORM_FOOTER}>
            <button
              onClick={() => void handleValidate()}
              disabled={validating || !validateCode.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg disabled:opacity-50"
            >
              {validating ? <Loader2 className="animate-spin" size={14} /> : <Search size={14} />}
              Validar
            </button>
          </div>

          {validateResult && (
            <div
              className={`rounded-xl border p-3 space-y-1 ${
                validateResult.valid
                  ? 'border-success/30 bg-success/5'
                  : 'border-error/30 bg-error/5'
              }`}
            >
              <div className="flex items-center gap-2">
                {validateResult.valid ? (
                  <Check size={16} className="text-success" />
                ) : (
                  <X size={16} className="text-error" />
                )}
                <span className="text-sm font-bold text-text-primary">
                  {validateResult.valid ? 'Voucher válido!' : 'Voucher inválido'}
                </span>
              </div>
              {validateResult.valid && (
                <p className="text-xs text-text-secondary">
                  Desconto: <strong className="text-accent">{fmt(validateResult.discount)}</strong>
                </p>
              )}
              {validateResult.message && (
                <p className="text-xs text-text-muted">{validateResult.message}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create/edit form */}
      {showForm && (
        <div className="rounded-2xl border border-accent bg-surface p-4 space-y-3">
          <h4 className="text-xs font-bold text-text-secondary">
            {editVoucher ? 'Editar voucher' : 'Novo voucher'}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nome *">
              <input
                type="text"
                placeholder="Ex: Black Friday 20%"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className={FIELD_CONTROL}
              />
            </Field>
            <Field label="Código (auto se vazio)">
              <input
                type="text"
                placeholder="Ex: BF20"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                className={FIELD_CONTROL}
              />
            </Field>
          </div>
          <Field label="Descrição (opcional)">
            <input
              type="text"
              placeholder="Descrição do voucher"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className={FIELD_CONTROL}
            />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Tipo *">
              <SmartSelect
                value={form.type}
                onChange={value => setForm(f => ({ ...f, type: value ?? 'PERCENTAGE' }))}
                options={voucherTypeOptions}
                clearable={false}
                searchable
              />
            </Field>
            <Field label={form.type === 'PERCENTAGE' ? 'Valor (%) *' : 'Valor (R$) *'}>
              <input
                type="number"
                placeholder="0"
                value={form.value}
                onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                className={FIELD_CONTROL}
                min="0"
                step="0.01"
              />
            </Field>
            <Field label="Compra mínima (R$)">
              <input
                type="number"
                placeholder="0.00"
                value={form.minPurchase}
                onChange={e => setForm(f => ({ ...f, minPurchase: e.target.value }))}
                className={FIELD_CONTROL}
                min="0"
                step="0.01"
              />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Limite total de usos">
              <input
                type="number"
                placeholder="Ilimitado"
                value={form.maxUses}
                onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                className={FIELD_CONTROL}
                min="1"
              />
            </Field>
            <Field label="Limite por cliente">
              <input
                type="number"
                placeholder="Ilimitado"
                value={form.perClientLimit}
                onChange={e => setForm(f => ({ ...f, perClientLimit: e.target.value }))}
                className={FIELD_CONTROL}
                min="1"
              />
            </Field>
            <div />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Válido de">
              <input
                type="date"
                value={form.validFrom}
                onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))}
                className={FIELD_CONTROL}
              />
            </Field>
            <Field label="Válido até *">
              <input
                type="date"
                value={form.validUntil}
                onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))}
                className={FIELD_CONTROL}
              />
            </Field>
          </div>

          <div className={FORM_FOOTER}>
            <button
              onClick={() => void handleSave()}
              disabled={saving || !form.name.trim() || !form.value || !form.validUntil}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
              {editVoucher ? 'Salvar' : 'Criar'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditVoucher(null); }}
              className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-surface-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Vouchers list */}
      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="animate-spin text-accent" size={28} />
        </div>
      ) : vouchers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <Ticket size={32} className="mx-auto text-text-muted" />
          <p className="mt-2 text-sm text-text-secondary">Nenhum voucher criado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {vouchers.map(voucher => (
            <div
              key={voucher.id}
              className={`rounded-2xl border bg-surface p-3 transition-colors ${
                selectedVoucher?.id === voucher.id ? 'border-accent' : 'border-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-text-primary">{voucher.name}</p>
                    <span className="font-mono text-[10px] bg-surface-2 px-1.5 py-0.5 rounded text-text-muted">
                      {voucher.code}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">
                    {TYPE_LABELS[voucher.type] || voucher.type}
                    {' · '}
                    <span className="font-bold">
                      {voucher.type === 'PERCENTAGE' ? `${voucher.value}%` : fmt(voucher.value)}
                    </span>
                    {' · '}
                    Usos: {voucher.currentUses}{voucher.maxUses ? `/${voucher.maxUses}` : ''}
                  </p>
                </div>

                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[voucher.status] || ''}`}>
                  {voucher.status}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => void handleSelectVoucher(voucher)}
                    className="rounded-lg px-2 py-1 text-[10px] font-bold text-text-secondary hover:bg-surface-2"
                  >
                    Usos
                  </button>
                  <button
                    onClick={() => handleOpenEdit(voucher)}
                    className="rounded-lg px-2 py-1 text-[10px] font-bold text-text-secondary hover:bg-surface-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => void handleDelete(voucher.id)}
                    className="rounded-lg p-2 text-text-muted hover:bg-error/10 hover:text-error"
                    title="Remover"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Detail & usages */}
              {selectedVoucher?.id === voucher.id && (
                <div className="mt-3 border-t border-border pt-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-text-secondary">Validade: {formatDate(voucher.validFrom)} — {formatDate(voucher.validUntil)}</span>
                    {voucher.minPurchase && <span className="text-text-secondary">Compra mín.: {fmt(voucher.minPurchase)}</span>}
                    {voucher.perClientLimit && <span className="text-text-secondary">Limite/cliente: {voucher.perClientLimit}</span>}
                    {voucher.description && <span className="text-text-secondary col-span-2">{voucher.description}</span>}
                  </div>
                  <h5 className="text-[10px] font-bold text-text-secondary">Histórico de uso</h5>
                  {usagesLoading ? (
                    <Loader2 size={24} className="w-4 h-4 animate-spin text-accent" />
                  ) : usages.length === 0 ? (
                    <p className="text-xs text-text-muted">Nenhum uso registrado.</p>
                  ) : (
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {usages.map(u => (
                        <div key={u.id} className="flex justify-between text-xs text-text-muted">
                          <span>{u.clientName || 'Anônimo'} · {formatDate(u.createdAt)}</span>
                          <span className="font-medium text-text-primary">{fmt(u.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
