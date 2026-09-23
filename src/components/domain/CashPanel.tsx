import React, { useCallback, useEffect, useState } from 'react';
import {
  LuCircleAlert as AlertCircle,
  LuBanknote as Banknote,
  LuCreditCard as CreditCard,
  LuFilter as Filter,
  LuLoaderCircle as Loader2,
  LuPlus as Plus,
  LuRefreshCcw as RefreshCcw,
  LuSmartphone as Smartphone,
  LuX as X,
} from 'react-icons/lu';
import { cashApi, CashMovement, CashSummary } from '../../infra/cashApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { formatCurrencyBRL, formatDateTimeBR } from '../../utils/formatters';
import { Field, FIELD_CONTROL, FORM_FOOTER } from '../ui/Field';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { SmartSelect } from '../ui/SmartSelect';
import { Button } from '../ui/Button';

type MovementType = 'SERVICE_SALE' | 'PRODUCT_SALE' | 'TIP' | 'EXPENSE' | 'OTHER';
type PaymentMethod = 'CASH' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'FIADO';

const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  SERVICE_SALE: 'Serviço',
  PRODUCT_SALE: 'Produto',
  TIP: 'Gorjeta',
  EXPENSE: 'Despesa',
  OTHER: 'Outro',
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Dinheiro',
  PIX: 'PIX',
  CREDIT_CARD: 'Cartão de Crédito',
  DEBIT_CARD: 'Cartão de Débito',
  FIADO: 'Fiado',
};

const PAYMENT_METHOD_ICONS: Record<PaymentMethod, React.ReactNode> = {
  CASH: <Banknote size={16} />,
  PIX: <Smartphone size={16} />,
  CREDIT_CARD: <CreditCard size={16} />,
  DEBIT_CARD: <CreditCard size={16} />,
  FIADO: <Banknote size={16} />,
};

interface MovementFormData {
  type: MovementType;
  amount: string;
  paymentMethod: PaymentMethod;
  description: string;
}

const INITIAL_FORM: MovementFormData = {
  type: 'SERVICE_SALE',
  amount: '',
  paymentMethod: 'PIX',
  description: '',
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const movementTypeOptions = (Object.keys(MOVEMENT_TYPE_LABELS) as MovementType[]).map(value => ({
  value,
  label: MOVEMENT_TYPE_LABELS[value],
}));

const paymentMethodOptions = (Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map(value => ({
  value,
  label: PAYMENT_METHOD_LABELS[value],
}));

const paymentMethodFilterOptions = [
  { value: 'ALL', label: 'Todos' },
  ...paymentMethodOptions,
];

export const CashPanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();
  const { user } = useAuth();

  const [summary, setSummary] = useState<CashSummary | null>(null);
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState<MovementFormData>(INITIAL_FORM);
  const [filterMethod, setFilterMethod] = useState<PaymentMethod | ''>('');

  const load = useCallback(async () => {
    if (!barbershopId) return;
    setLoading(true);
    setError(null);
    try {
      const [s, m] = await Promise.all([
        cashApi.getSummary(barbershopId, todayIso()),
        cashApi.getMovements(barbershopId, {
          date: todayIso(),
          paymentMethod: filterMethod || undefined,
        }),
      ]);
      setSummary(s);
      setMovements(Array.isArray(m) ? m : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [barbershopId, filterMethod]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async () => {
    if (!barbershopId) return;
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      setSubmitError('Valor inválido');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await cashApi.registerMovement(barbershopId, {
        type: form.type,
        amount,
        paymentMethod: form.paymentMethod,
        description: form.description || undefined,
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

  const todayTotal = summary?.total ?? 0;
  const byMethod = summary?.byMethod ?? {};

  const filteredMovements = filterMethod
    ? movements.filter(m => m.paymentMethod === filterMethod)
    : movements;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Caixa</h2>
          <p className="text-sm text-text-muted">Movimentações do dia</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={load}
            disabled={loading}
            className="h-10"
          >
            <RefreshCcw size={15} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button
            onClick={() => setModalOpen(true)}
            className="h-10"
          >
            <Plus size={16} />
            Registrar movimentação
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-[0_18px_44px_-32px_rgba(0,0,0,0.65)]">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-xl border border-accent/30 bg-selection p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Total recebido
            </p>
            <p className="mt-1 text-xl font-bold text-text-primary">{formatCurrencyBRL(todayTotal)}</p>
          </div>
          {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map(method => {
            const entry = byMethod[method];
            return (
              <div
                key={method}
                className="flex items-center gap-3 rounded-xl border border-border bg-bg p-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-text-muted">
                  {PAYMENT_METHOD_ICONS[method]}
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    {PAYMENT_METHOD_LABELS[method]}
                  </p>
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {formatCurrencyBRL(entry?.total ?? 0)}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {entry?.count ?? 0} {entry?.count === 1 ? 'movimentação' : 'movimentações'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-[0_18px_44px_-32px_rgba(0,0,0,0.65)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Movimentações</h3>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-text-muted" />
            <SmartSelect
              value={(filterMethod || 'ALL') as PaymentMethod | 'ALL'}
              onChange={value => setFilterMethod(value === 'ALL' || !value ? '' : value)}
              options={paymentMethodFilterOptions}
              clearable={false}
              size="sm"
              searchable
              aria-label="Filtrar forma de pagamento"
              placeholder="Todos"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="py-12 text-center text-sm text-text-muted">
            Nenhuma movimentação registrada
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMovements.map(m => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-border bg-bg px-4 py-3 transition-colors hover:bg-surface"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">
                      {MOVEMENT_TYPE_LABELS[m.type as MovementType] ?? m.type}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-0.5 text-[10px] font-semibold uppercase text-text-muted">
                      {PAYMENT_METHOD_LABELS[m.paymentMethod as PaymentMethod] ?? m.paymentMethod}
                    </span>
                  </div>
                  {m.description && (
                    <p className="mt-0.5 truncate text-xs text-text-muted">{m.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-text-primary">
                    {formatCurrencyBRL(m.amount)}
                  </p>
                  <p className="text-[11px] text-text-muted">{formatDateTimeBR(m.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Nova movimentação</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text-secondary transition-colors hover:bg-bg hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Tipo">
                <SmartSelect
                  value={form.type}
                  onChange={value => setForm(f => ({ ...f, type: value ?? 'OTHER' }))}
                  options={movementTypeOptions}
                  clearable={false}
                  searchable
                />
              </Field>

              <Field label="Valor (R$)">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0,00"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className={FIELD_CONTROL}
                />
              </Field>

              <Field label="Forma de pagamento">
                <SmartSelect
                  value={form.paymentMethod}
                  onChange={value =>
                    setForm(f => ({ ...f, paymentMethod: value ?? 'PIX' }))
                  }
                  options={paymentMethodOptions}
                  clearable={false}
                  searchable
                />
              </Field>

              <Field label="Descrição (opcional)">
                <input
                  type="text"
                  placeholder="Ex: corte de cabelo, gorjeta..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className={FIELD_CONTROL}
                />
              </Field>

              {submitError && (
                <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                  <AlertCircle size={14} />
                  {submitError}
                </div>
              )}
            </div>

            <div className={FORM_FOOTER}>
              <Button
                variant="secondary"
                onClick={() => setModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                loading={submitting}
                disabled={!form.amount}
                className="flex-1"
              >
                Registrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
