import { useCategories } from '../../hooks/useCategories';
import { CategoryManager } from './CategoryManager';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Banknote,
  Check,
  CheckCircle,
  CreditCard,
  Download,
  Edit3,
  Filter,
  Loader2,
  Plus,
  Receipt,
  RefreshCcw,
  Trash2,
  TrendingDown,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { getErrorMessage } from '../../utils/errorMessage';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Field, FIELD_CONTROL, FIELD_CONTROL_ERROR, FORM_GRID } from '../ui/Field';
import { SmartSelect } from '../ui/SmartSelect';
import {
  ExpenseCategory,
  ExpenseItem,
  ExpenseSummary,
  ExpenseType,
  FiadoItem,
  financialApi,
  FinancialSummary,
  ListMeta,
} from '../../infra/financialApi';
import { ExpenseSchema, ExpenseFormData, FiadoSchema, FiadoFormData } from '../../schemas';
import { formatCurrencyBRL, formatDateBR, formatDateTimeBR } from '../../utils/formatters';
import {
  EXPENSE_RECURRENCE_LABELS,
  EXPENSE_TYPE_LABELS,
  FINANCE_PAYMENT_METHODS,
  FiadoStatusBadge,
  FinanceSummaryCard,
} from '../../features/finance';

type Tab = 'resumo' | 'despesas' | 'fiado';

const errorMessage = (err: unknown): string => getErrorMessage(err);

const EMPTY_META: ListMeta = { total: 0, page: 1, limit: 20, totalPages: 1 };

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'resumo', label: 'Resumo', icon: <Wallet size={14} /> },
  { id: 'despesas', label: 'Despesas', icon: <Receipt size={14} /> },
  { id: 'fiado', label: 'Fiado', icon: <CreditCard size={14} /> },
];

const todayIso = () => new Date().toISOString().slice(0, 10);

export const OwnerFinancialPanel: React.FC = () => {
  const [tab, setTab] = useState<Tab>('resumo');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummary | null>(null);
  const [expensesMeta, setExpensesMeta] = useState<ListMeta>(EMPTY_META);
  const [expensesPage, setExpensesPage] = useState(1);

  const [fiados, setFiados] = useState<FiadoItem[]>([]);
  const [fiadosMeta, setFiadosMeta] = useState<ListMeta>(EMPTY_META);
  const [fiadosPage, setFiadosPage] = useState(1);

  const [expenseSubmitting, setExpenseSubmitting] = useState(false);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);

  const categoryState = useCategories('expense');
  const { categories } = categoryState;
  const [expenseFilters, setExpenseFilters] = useState({
    categoryId: '',
    type: '',
    paid: '',
    search: '',
    from: '',
    to: '',
  });
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);

  const [fiadoSubmitting, setFiadoSubmitting] = useState(false);

  const [paymentFiadoId, setPaymentFiadoId] = useState<string | null>(null);
  const [chargeFiadoId, setChargeFiadoId] = useState<string | null>(null);
  const [chargePixKey, setChargePixKey] = useState('');
  const [chargeCardLink, setChargeCardLink] = useState('');
  const [chargeSubmitting, setChargeSubmitting] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [deleteFiadoId, setDeleteFiadoId] = useState<string | null>(null);
  const [deleteFiadoLoading, setDeleteFiadoLoading] = useState(false);

  const {
    register: registerExpense,
    handleSubmit: handleExpenseSubmit,
    reset: resetExpense,
    getValues: getExpenseValues,
    setValue: setExpenseValue,
    watch: watchExpense,
    formState: { errors: expenseErrors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(ExpenseSchema),
    defaultValues: {
      title: '',
      amount: 0,
      type: 'VARIABLE',
      referenceDate: todayIso(),
      categoryId: '',
      description: '',
      notes: '',
      recurrence: 'ONCE',
      dueDate: '',
      paymentMethod: '',
      supplierName: '',
    },
  });

  const {
    register: registerFiado,
    handleSubmit: handleFiadoSubmit,
    reset: resetFiado,
    formState: { errors: fiadoErrors },
  } = useForm<FiadoFormData>({
    resolver: zodResolver(FiadoSchema),
    defaultValues: {
      customerName: '',
      whatsapp: '',
      description: '',
      amount: 0,
      dueDate: '',
    },
  });

  useEffect(() => {
    if (tab === 'despesas') {
      setExpensesPage(1);
    }
  }, [tab, expenseFilters]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'resumo') {
        const data = await financialApi.getSummary();
        setSummary(data);
      } else if (tab === 'despesas') {
        const [result, summaryResult] = await Promise.all([
          financialApi.listExpenses({
            page: expensesPage,
            limit: 20,
            search: expenseFilters.search || undefined,
            categoryId: expenseFilters.categoryId || undefined,
            type: (expenseFilters.type as ExpenseType) || undefined,
            paid: expenseFilters.paid || undefined,
            from: expenseFilters.from || undefined,
            to: expenseFilters.to || undefined,
          }),
          financialApi
            .getExpenseSummary({
              from: expenseFilters.from || undefined,
              to: expenseFilters.to || undefined,
            })
            .catch(() => null),
        ]);
        setExpenses(result.data);
        setExpensesMeta(result.meta ?? EMPTY_META);
        setExpenseSummary(summaryResult);
      } else {
        const result = await financialApi.listFiados({ page: fiadosPage });
        setFiados(result.data);
        setFiadosMeta(result.meta ?? EMPTY_META);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [tab, expensesPage, fiadosPage, expenseFilters]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const handleRefresh = () => setRefreshKey(k => k + 1);

  const onCreateExpense = async (data: ExpenseFormData) => {
    setExpenseSubmitting(true);
    setError(null);
    try {
      await financialApi.createExpense({
        title: data.title.trim(),
        amount: data.amount,
        type: data.type,
        referenceDate: data.referenceDate,
        categoryId: data.categoryId || null,
        description: data.description?.trim() || null,
        notes: data.notes?.trim() || null,
        recurrence: data.recurrence,
        dueDate: data.dueDate || null,
        paymentMethod: data.paymentMethod || null,
        supplierName: data.supplierName || null,
      });
      resetExpense();
      handleRefresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setExpenseSubmitting(false);
    }
  };

  const handleUpdateExpense = async () => {
    if (!editingExpense) return;
    const amount = parseFloat(editingExpense.amount.toString());
    if (!editingExpense.title.trim() || !amount || amount <= 0) return;

    setExpenseSubmitting(true);
    setError(null);
    try {
      await financialApi.updateExpense(editingExpense.id, {
        title: editingExpense.title.trim(),
        amount,
        type: editingExpense.type,
        referenceDate: editingExpense.referenceDate,
        categoryId: editingExpense.categoryId || null,
        description: editingExpense.description || null,
        notes: editingExpense.notes || null,
        recurrence: editingExpense.recurrence,
        dueDate: editingExpense.dueDate || null,
        paymentMethod: editingExpense.paymentMethod || null,
        supplierName: editingExpense.supplierName || null,
      });
      setEditingExpense(null);
      handleRefresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setExpenseSubmitting(false);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    setExpenseSubmitting(true);
    setError(null);
    try {
      await financialApi.updateExpense(id, { paidAt: new Date().toISOString() } as any);
      handleRefresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setExpenseSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    setError(null);
    try {
      await financialApi.deleteExpense(id);
      setDeleteExpenseId(null);
      handleRefresh();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleExportCsv = () => {
    const params: Record<string, string | undefined> = {};
    if (expenseFilters.search) params.search = expenseFilters.search;
    if (expenseFilters.categoryId) params.categoryId = expenseFilters.categoryId;
    if (expenseFilters.type) params.type = expenseFilters.type;
    if (expenseFilters.paid) params.paid = expenseFilters.paid;
    if (expenseFilters.from) params.from = expenseFilters.from;
    if (expenseFilters.to) params.to = expenseFilters.to;
    financialApi.exportExpensesCsv(Object.keys(params).length ? params : undefined);
  };

  const onCreateFiado = async (data: FiadoFormData) => {
    setFiadoSubmitting(true);
    setError(null);
    try {
      await financialApi.createFiado({
        customerName: data.customerName.trim(),
        whatsapp: data.whatsapp,
        description: data.description.trim(),
        amount: data.amount,
        dueDate: data.dueDate || null,
      });
      resetFiado();
      handleRefresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setFiadoSubmitting(false);
    }
  };

  const handleDeleteFiado = async () => {
    if (!deleteFiadoId) return;
    setDeleteFiadoLoading(true);
    setError(null);
    try {
      await financialApi.deleteFiado(deleteFiadoId);
      setDeleteFiadoId(null);
      handleRefresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setDeleteFiadoLoading(false);
    }
  };

  const handleAddPayment = async (fiadoId: string) => {
    const amount = parseFloat(paymentAmount.replace(',', '.'));
    if (!amount || amount <= 0) return;

    setPaymentSubmitting(true);
    setError(null);
    try {
      await financialApi.addFiadoPayment(fiadoId, {
        amount,
        notes: paymentNotes.trim() || undefined,
      });
      setPaymentFiadoId(null);
      setPaymentAmount('');
      setPaymentNotes('');
      handleRefresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const openPaymentForm = (fiado: FiadoItem) => {
    setChargeFiadoId(null);
    setPaymentFiadoId(fiado.id);
    setPaymentAmount(String(fiado.remainingAmount));
    setPaymentNotes('');
  };

  const openChargeForm = (fiado: FiadoItem) => {
    setPaymentFiadoId(null);
    setChargeFiadoId(fiado.id);
    setChargePixKey('');
    setChargeCardLink('');
  };

  const handleChargeFiado = async (fiadoId: string) => {
    if (!chargePixKey.trim() && !chargeCardLink.trim()) {
      setError('Informe uma chave PIX ou um link de cartão para enviar a cobrança.');
      return;
    }
    setChargeSubmitting(true);
    setError(null);
    try {
      await financialApi.chargeFiado(fiadoId, {
        pixKey: chargePixKey.trim() || undefined,
        cardPaymentLink: chargeCardLink.trim() || undefined,
      });
      setChargeFiadoId(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setChargeSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 bg-surface p-4 rounded-xl border border-border">
          <div className="flex justify-between items-center gap-3">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Banknote className="text-accent" /> Financeiro
            </h2>
            <button
              onClick={handleRefresh}
              disabled={loading}
              title="Atualizar"
              className="w-9 h-9 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-2 rounded-lg border border-border transition-all disabled:opacity-50"
            >
              <RefreshCcw size={16} className={loading ? 'animate-spin text-accent' : ''} />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all whitespace-nowrap flex items-center gap-2
                ${
                  tab === t.id
                    ? 'bg-accent border-accent text-accent-fg'
                    : 'bg-bg border-border text-text-muted hover:border-border-strong'
                }
              `}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle size={18} className="text-red-400 shrink-0" />
            <p className="text-sm text-red-400 flex-1">{error}</p>
            <button
              onClick={handleRefresh}
              className="text-xs font-bold text-text-secondary hover:text-text-primary border border-border rounded-lg px-3 py-1.5 hover:bg-surface-2 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {tab === 'resumo' && (
          <div className="space-y-4">
            {loading && !summary ? (
              <div className="flex items-center justify-center py-16 text-text-muted gap-2">
                <Loader2 size={20} className="animate-spin text-accent" />
                <span className="text-sm">Carregando resumo...</span>
              </div>
            ) : summary ? (
              <>
                <p className="text-xs text-text-muted uppercase font-bold tracking-wider">
                  Despesas
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <FinanceSummaryCard
                    icon={<TrendingDown size={48} />}
                    label="Total"
                    value={formatCurrencyBRL(summary.expenses.total)}
                    tone="negative"
                  />
                  <FinanceSummaryCard
                    icon={<Check size={48} />}
                    label="Pagas"
                    value={formatCurrencyBRL(summary.expenses.totalPaid)}
                    tone="positive"
                  />
                  <FinanceSummaryCard
                    icon={<Receipt size={48} />}
                    label="Pendentes"
                    value={formatCurrencyBRL(summary.expenses.totalPending)}
                  />
                  <FinanceSummaryCard
                    icon={<Receipt size={48} />}
                    label="Lançamentos"
                    value={String(summary.expenses.count)}
                    isCount
                  />
                </div>

                <p className="text-xs text-text-muted uppercase font-bold tracking-wider pt-2">
                  Fiado
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <FinanceSummaryCard
                    icon={<Users size={48} />}
                    label="Devedores"
                    value={String(summary.fiados.activeDebtors)}
                    isCount
                  />
                  <FinanceSummaryCard
                    icon={<CreditCard size={48} />}
                    label="Em aberto"
                    value={formatCurrencyBRL(summary.fiados.totalPending)}
                    tone="negative"
                  />
                  <FinanceSummaryCard
                    icon={<Wallet size={48} />}
                    label="Já recebido"
                    value={formatCurrencyBRL(summary.fiados.totalPaid)}
                    tone="positive"
                  />
                  <FinanceSummaryCard
                    icon={<AlertCircle size={48} />}
                    label="Vencidos"
                    value={formatCurrencyBRL(summary.fiados.overdueAmount)}
                    hint={`${summary.fiados.overdueCount} fiado(s)`}
                    tone="negative"
                  />
                </div>

                {summary.packages && (
                  <>
                    <p className="text-xs text-text-muted uppercase font-bold tracking-wider pt-2">
                      Pacotes vendidos
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <FinanceSummaryCard
                        icon={<CreditCard size={48} />}
                        label="Vendas"
                        value={String(summary.packages.count)}
                        isCount
                      />
                      <FinanceSummaryCard
                        icon={<Wallet size={48} />}
                        label="Recebido"
                        value={formatCurrencyBRL(summary.packages.totalPaid)}
                        tone="positive"
                      />
                    </div>
                  </>
                )}

                {summary.products && (
                  <>
                    <p className="text-xs text-text-muted uppercase font-bold tracking-wider pt-2">
                      Produtos
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <FinanceSummaryCard
                        icon={<Wallet size={48} />}
                        label="Receita de produtos"
                        value={formatCurrencyBRL(
                          summary.products.netRevenue ?? summary.products.revenue
                        )}
                      />
                      {summary.products.refunded > 0 && (
                        <FinanceSummaryCard
                          icon={<Receipt size={48} />}
                          label="Estornos"
                          value={formatCurrencyBRL(summary.products.refunded)}
                          tone="negative"
                        />
                      )}
                      <FinanceSummaryCard
                        icon={<CreditCard size={48} />}
                        label="CMV"
                        value={formatCurrencyBRL(summary.products.cogs)}
                      />
                      <FinanceSummaryCard
                        icon={<Wallet size={48} />}
                        label="Margem bruta"
                        value={formatCurrencyBRL(summary.products.margin)}
                        tone="positive"
                      />
                      <FinanceSummaryCard
                        icon={<Receipt size={48} />}
                        label="Compras de estoque"
                        value={formatCurrencyBRL(summary.products.stockPurchases)}
                      />
                      <FinanceSummaryCard
                        icon={<Wallet size={48} />}
                        label="Valor em estoque"
                        value={formatCurrencyBRL(summary.products.inventoryValue)}
                      />
                      <FinanceSummaryCard
                        icon={<AlertCircle size={48} />}
                        label="Abaixo do mínimo"
                        value={String(summary.products.lowStockCount)}
                        isCount
                        tone="negative"
                      />
                    </div>
                    <p className="text-xs text-text-muted">
                      A margem de varejo usa o custo congelado da venda e já desconta estornos na
                      receita líquida.
                    </p>
                  </>
                )}

                {Array.isArray(summary.expenses?.byType) && summary.expenses.byType.length > 0 && (
                  <div className="bg-surface p-5 rounded-xl border border-border">
                    <h3 className="text-sm font-bold text-text-primary mb-4">Despesas por tipo</h3>
                    <div className="space-y-2">
                      {summary.expenses.byType.map(row => (
                        <div key={row.type} className="flex justify-between items-center text-sm">
                          <span className="text-text-secondary">
                            {EXPENSE_TYPE_LABELS[row.type] ?? row.type}
                            <span className="text-text-muted ml-2">({row.count})</span>
                          </span>
                          <span className="font-bold text-text-primary">
                            {formatCurrencyBRL(row.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        {tab === 'despesas' && (
          <div className="space-y-4">
            <CategoryManager key={categoryState.barbershopId || 'global'} title="Categorias de despesas" linkedLabel="Os lançamentos vinculados" state={categoryState} onChanged={(id, category) => {
              if (!category) {
                if (getExpenseValues('categoryId') === id) setExpenseValue('categoryId', '');
                setExpenseFilters(filters => filters.categoryId === id ? { ...filters, categoryId: '' } : filters);
              }
              setEditingExpense(item => item?.categoryId === id ? { ...item, categoryId: category ? id : null, categoryName: category?.name ?? null } : item);
              setExpenses(items => items.map(item => item.categoryId === id ? { ...item, categoryId: category ? id : null, categoryName: category?.name ?? null } : item));
              handleRefresh();
            }} />
            <form
              onSubmit={handleExpenseSubmit(onCreateExpense)}
              className="bg-surface p-4 rounded-xl border border-border space-y-3"
            >
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Plus size={16} className="text-accent" /> Nova despesa
              </h3>
              <div className={FORM_GRID}>
                <Field label="Título" error={expenseErrors.title?.message}>
                  <input
                    type="text"
                    placeholder="Ex.: Aluguel"
                    className={expenseErrors.title ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                    {...registerExpense('title')}
                  />
                </Field>
                <Field label="Valor (R$)" error={expenseErrors.amount?.message}>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0,00"
                    className={expenseErrors.amount ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                    {...registerExpense('amount')}
                  />
                </Field>
              </div>
              <div className={FORM_GRID}>
                <SmartSelect
                  label="Tipo"
                  value={watchExpense('type')}
                  onChange={val => setExpenseValue('type', val as any)}
                  options={[
                    { value: 'VARIABLE', label: 'Variável' },
                    { value: 'FIXED', label: 'Fixa' },
                    { value: 'INVESTMENT', label: 'Investimento' },
                  ]}
                  clearable={false}
                  size="sm"
                  error={expenseErrors.type?.message}
                />
                <SmartSelect
                  label="Categoria"
                  value={watchExpense('categoryId') || null}
                  onChange={val => setExpenseValue('categoryId', val ?? '')}
                  options={[
                    { value: '', label: 'Sem categoria' },
                    ...categories.map(c => ({ value: c.id, label: c.name })),
                  ]}
                  size="sm"
                  error={expenseErrors.categoryId?.message}
                />
              </div>
              <div className={FORM_GRID}>
                <Field label="Data de referência" error={expenseErrors.referenceDate?.message}>
                  <input
                    type="date"
                    className={FIELD_CONTROL}
                    {...registerExpense('referenceDate')}
                  />
                </Field>
                <Field label="Vencimento" error={expenseErrors.dueDate?.message}>
                  <input type="date" className={FIELD_CONTROL} {...registerExpense('dueDate')} />
                </Field>
              </div>
              <div className={FORM_GRID}>
                <SmartSelect
                  label="Recorrência"
                  value={watchExpense('recurrence')}
                  onChange={val => setExpenseValue('recurrence', val as any)}
                  options={[
                    { value: 'ONCE', label: 'Única' },
                    { value: 'DAILY', label: 'Diária' },
                    { value: 'WEEKLY', label: 'Semanal' },
                    { value: 'MONTHLY', label: 'Mensal' },
                    { value: 'YEARLY', label: 'Anual' },
                  ]}
                  clearable={false}
                  size="sm"
                  error={expenseErrors.recurrence?.message}
                />
                <SmartSelect
                  label="Forma de pagamento"
                  value={watchExpense('paymentMethod') || null}
                  onChange={val => setExpenseValue('paymentMethod', val ?? '')}
                  options={[
                    { value: '', label: 'Selecione' },
                    ...FINANCE_PAYMENT_METHODS.map(m => ({ value: m, label: m })),
                  ]}
                  size="sm"
                  error={expenseErrors.paymentMethod?.message}
                />
              </div>
              <div className={FORM_GRID}>
                <Field label="Fornecedor" error={expenseErrors.supplierName?.message}>
                  <input
                    type="text"
                    placeholder="Nome do fornecedor"
                    className={FIELD_CONTROL}
                    {...registerExpense('supplierName')}
                  />
                </Field>
                <Field label="Descrição" error={expenseErrors.description?.message}>
                  <input
                    type="text"
                    placeholder="Detalhes da despesa"
                    className={FIELD_CONTROL}
                    {...registerExpense('description')}
                  />
                </Field>
              </div>
              <Field label="Observações" error={expenseErrors.notes?.message}>
                <input
                  type="text"
                  placeholder="Notas adicionais"
                  className={FIELD_CONTROL}
                  {...registerExpense('notes')}
                />
              </Field>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={expenseSubmitting}
                  className="min-h-11 px-4 py-2 bg-accent text-accent-fg rounded-lg text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {expenseSubmitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} />
                  )}
                  Adicionar
                </button>
              </div>
            </form>

            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border bg-surface/50 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <Receipt size={16} className="text-accent" /> Despesas
                  </h3>
                  <span className="text-xs text-text-muted">{expensesMeta.total} registros</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={expenseFilters.search}
                    onChange={e => setExpenseFilters(f => ({ ...f, search: e.target.value }))}
                    className="bg-bg border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent w-40"
                  />
                  <SmartSelect
                    value={expenseFilters.categoryId || null}
                    onChange={val => setExpenseFilters(f => ({ ...f, categoryId: val ?? '' }))}
                    options={[
                      { value: '', label: 'Todas categorias' },
                      ...categories.map(c => ({ value: c.id, label: c.name })),
                    ]}
                    size="sm"
                    aria-label="Filtrar por categoria"
                  />
                  <SmartSelect
                    value={expenseFilters.type || null}
                    onChange={val => setExpenseFilters(f => ({ ...f, type: val ?? '' }))}
                    options={[
                      { value: '', label: 'Todos tipos' },
                      { value: 'FIXED', label: 'Fixa' },
                      { value: 'VARIABLE', label: 'Variável' },
                      { value: 'INVESTMENT', label: 'Investimento' },
                    ]}
                    size="sm"
                    aria-label="Filtrar por tipo"
                  />
                  <SmartSelect
                    value={expenseFilters.paid || null}
                    onChange={val => setExpenseFilters(f => ({ ...f, paid: val ?? '' }))}
                    options={[
                      { value: '', label: 'Todos status' },
                      { value: 'true', label: 'Pagas' },
                      { value: 'false', label: 'Pendentes' },
                    ]}
                    size="sm"
                    aria-label="Filtrar por status"
                  />
                  <input
                    type="date"
                    aria-label="Data inicial"
                    value={expenseFilters.from}
                    onChange={e => setExpenseFilters(f => ({ ...f, from: e.target.value }))}
                    className="bg-bg border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                  <input
                    type="date"
                    aria-label="Data final"
                    value={expenseFilters.to}
                    onChange={e => setExpenseFilters(f => ({ ...f, to: e.target.value }))}
                    className="bg-bg border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                  <button
                    onClick={() =>
                      setExpenseFilters({
                        categoryId: '',
                        type: '',
                        paid: '',
                        search: '',
                        from: '',
                        to: '',
                      })
                    }
                    className="px-3 py-1.5 text-xs font-bold text-text-muted hover:text-text-primary border border-border rounded-lg hover:bg-surface-2 transition-colors flex items-center gap-1"
                  >
                    <X size={12} /> Limpar filtros
                  </button>
                  <button
                    onClick={handleExportCsv}
                    className="px-3 py-1.5 text-xs font-bold text-text-muted hover:text-text-primary border border-border rounded-lg hover:bg-surface-2 transition-colors flex items-center gap-1"
                  >
                    <Download size={12} /> CSV
                  </button>
                </div>
                {expenseSummary && (
                  <>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <FinanceSummaryCard
                        icon={<TrendingDown size={42} />}
                        label="Total"
                        value={formatCurrencyBRL(expenseSummary.totalAmount)}
                        tone="negative"
                      />
                      <FinanceSummaryCard
                        icon={<Check size={42} />}
                        label="Pagas"
                        value={formatCurrencyBRL(expenseSummary.totalPaid)}
                        tone="positive"
                      />
                      <FinanceSummaryCard
                        icon={<Receipt size={42} />}
                        label="Pendentes"
                        value={formatCurrencyBRL(expenseSummary.totalPending)}
                      />
                      <FinanceSummaryCard
                        icon={<Wallet size={42} />}
                        label="Categorias"
                        value={String(expenseSummary.byCategory.length)}
                        isCount
                      />
                    </div>
                    {expenseSummary.byCategory.length > 0 && (
                      <div className="mt-3 rounded-xl border border-border bg-bg p-3">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                          Por categoria
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {expenseSummary.byCategory.map(row => (
                            <div
                              key={row.categoryId ?? 'uncategorized'}
                              className="flex items-center justify-between gap-2 text-xs"
                            >
                              <span className="text-text-secondary">
                                {row.categoryName ?? 'Sem categoria'}{' '}
                                <span className="text-text-muted">({row.count})</span>
                              </span>
                              <strong className="text-text-primary">
                                {formatCurrencyBRL(row.total)}
                              </strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="max-h-[420px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-text-muted text-sm flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Carregando...
                  </div>
                ) : expenses.length === 0 ? (
                  <div className="p-8 text-center text-text-muted text-sm">
                    Nenhuma despesa registrada.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-[920px] w-full text-left border-collapse">
                      <thead className="bg-bg text-text-muted text-[10px] uppercase tracking-wider sticky top-0">
                        <tr>
                          <th className="p-3 font-medium">Data ref.</th>
                          <th className="p-3 font-medium">Título</th>
                          <th className="p-3 font-medium hidden sm:table-cell">Categoria</th>
                          <th className="p-3 font-medium">Tipo</th>
                          <th className="p-3 font-medium text-right">Valor</th>
                          <th className="p-3 font-medium hidden md:table-cell">Vencimento</th>
                          <th className="p-3 font-medium hidden lg:table-cell">Status</th>
                          <th className="p-3 font-medium hidden lg:table-cell">Pagamento</th>
                          <th className="p-3 font-medium text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {expenses.map(item => (
                          <React.Fragment key={item.id}>
                            <tr className="text-xs text-text-secondary hover:bg-surface">
                              <td className="p-3 whitespace-nowrap">
                                {formatDateBR(item.referenceDate)}
                              </td>
                              <td className="p-3">
                                <div className="font-medium text-text-primary">{item.title}</div>
                                {item.supplierName && (
                                  <div className="text-text-muted text-[10px]">
                                    {item.supplierName}
                                  </div>
                                )}
                              </td>
                              <td className="p-3 hidden sm:table-cell">
                                {item.categoryName || <span className="text-text-muted">Sem categoria</span>}
                              </td>
                              <td className="p-3">{EXPENSE_TYPE_LABELS[item.type] ?? item.type}</td>
                              <td className="p-3 text-right text-danger font-medium">
                                {formatCurrencyBRL(item.amount)}
                              </td>
                              <td className="p-3 hidden md:table-cell whitespace-nowrap">
                                {formatDateBR(item.dueDate)}
                              </td>
                              <td className="p-3 hidden lg:table-cell">
                                {item.paidAt ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-500/10 text-green-400 border border-green-500/20">
                                    Pago
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    Pendente
                                  </span>
                                )}
                              </td>
                              <td className="p-3 hidden lg:table-cell">
                                {item.paymentMethod || <span className="text-text-muted">—</span>}
                              </td>
                              <td className="p-3 text-center">
                                {deleteExpenseId === item.id ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => handleDeleteExpense(item.id)}
                                      className="p-1 bg-danger text-accent-fg rounded"
                                    >
                                      <Check size={12} />
                                    </button>
                                    <button
                                      onClick={() => setDeleteExpenseId(null)}
                                      className="p-1 bg-surface-2 text-text-secondary rounded"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-1.5">
                                    {!item.paidAt && (
                                      <button
                                        onClick={() => handleMarkAsPaid(item.id)}
                                        title="Marcar como pago"
                                        disabled={expenseSubmitting}
                                        className="text-text-muted hover:text-green-400 disabled:opacity-30"
                                      >
                                        <CheckCircle size={14} />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => setEditingExpense(item)}
                                      title="Editar"
                                      className="text-text-muted hover:text-accent"
                                    >
                                      <Edit3 size={14} />
                                    </button>
                                    <button
                                      onClick={() => setDeleteExpenseId(item.id)}
                                      className="text-text-muted hover:text-danger"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                            {editingExpense?.id === item.id && (
                              <tr className="bg-bg/60">
                                <td colSpan={9} className="p-3">
                                  <div className="space-y-4">
                                    <div className={FORM_GRID}>
                                      <Field label="Título">
                                        <input
                                          type="text"
                                          placeholder="Título"
                                          value={editingExpense.title}
                                          onChange={e =>
                                            setEditingExpense(ex =>
                                              ex ? { ...ex, title: e.target.value } : null
                                            )
                                          }
                                          className={FIELD_CONTROL}
                                        />
                                      </Field>
                                      <Field label="Valor (R$)">
                                        <input
                                          type="number"
                                          step="0.01"
                                          min="0.01"
                                          placeholder="0,00"
                                          value={editingExpense.amount}
                                          onChange={e =>
                                            setEditingExpense(ex =>
                                              ex
                                                ? { ...ex, amount: parseFloat(e.target.value) || 0 }
                                                : null
                                            )
                                          }
                                          className={FIELD_CONTROL}
                                        />
                                      </Field>
                                    </div>
                                    <div className={FORM_GRID}>
                                      <SmartSelect
                                        label="Tipo"
                                        value={editingExpense.type}
                                        onChange={val => setEditingExpense(ex => ex ? { ...ex, type: val as ExpenseType } : null)}
                                        options={[
                                          { value: 'VARIABLE', label: 'Variável' },
                                          { value: 'FIXED', label: 'Fixa' },
                                          { value: 'INVESTMENT', label: 'Investimento' },
                                        ]}
                                        clearable={false}
                                        size="sm"
                                      />
                                      <SmartSelect
                                        label="Categoria"
                                        value={editingExpense.categoryId || null}
                                        onChange={val => setEditingExpense(ex => ex ? { ...ex, categoryId: val || null } : null)}
                                        options={[
                                          { value: '', label: 'Sem categoria' },
                                          ...categories.map(c => ({ value: c.id, label: c.name })),
                                        ]}
                                        size="sm"
                                      />
                                    </div>
                                    <div className={FORM_GRID}>
                                      <Field label="Data de referência">
                                        <input
                                          type="date"
                                          value={editingExpense.referenceDate?.slice(0, 10) ?? ''}
                                          onChange={e =>
                                            setEditingExpense(ex =>
                                              ex ? { ...ex, referenceDate: e.target.value } : null
                                            )
                                          }
                                          className={FIELD_CONTROL}
                                        />
                                      </Field>
                                      <Field label="Vencimento">
                                        <input
                                          type="date"
                                          value={editingExpense.dueDate?.slice(0, 10) ?? ''}
                                          onChange={e =>
                                            setEditingExpense(ex =>
                                              ex ? { ...ex, dueDate: e.target.value || null } : null
                                            )
                                          }
                                          className={FIELD_CONTROL}
                                        />
                                      </Field>
                                    </div>
                                    <div className={FORM_GRID}>
                                      <SmartSelect
                                        label="Forma de pagamento"
                                        value={editingExpense.paymentMethod || null}
                                        onChange={val => setEditingExpense(ex => ex ? { ...ex, paymentMethod: val || null } : null)}
                                        options={[
                                          { value: '', label: 'Selecione' },
                                          ...FINANCE_PAYMENT_METHODS.map(m => ({ value: m, label: m })),
                                        ]}
                                        size="sm"
                                      />
                                      <Field label="Fornecedor">
                                        <input
                                          type="text"
                                          placeholder="Fornecedor"
                                          value={editingExpense.supplierName ?? ''}
                                          onChange={e =>
                                            setEditingExpense(ex =>
                                              ex
                                                ? { ...ex, supplierName: e.target.value || null }
                                                : null
                                            )
                                          }
                                          className={FIELD_CONTROL}
                                        />
                                      </Field>
                                    </div>
                                    <div className={FORM_GRID}>
                                      <Field label="Descrição">
                                        <input
                                          type="text"
                                          placeholder="Descrição"
                                          value={editingExpense.description ?? ''}
                                          onChange={e =>
                                            setEditingExpense(ex =>
                                              ex
                                                ? { ...ex, description: e.target.value || null }
                                                : null
                                            )
                                          }
                                          className={FIELD_CONTROL}
                                        />
                                      </Field>
                                      <Field label="Observações">
                                        <input
                                          type="text"
                                          placeholder="Observações"
                                          value={editingExpense.notes ?? ''}
                                          onChange={e =>
                                            setEditingExpense(ex =>
                                              ex ? { ...ex, notes: e.target.value || null } : null
                                            )
                                          }
                                          className={FIELD_CONTROL}
                                        />
                                      </Field>
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-2 mt-3">
                                    <button
                                      onClick={() => handleUpdateExpense()}
                                      disabled={expenseSubmitting}
                                      className="px-3 py-1.5 bg-accent text-accent-fg rounded-lg text-xs font-bold flex items-center gap-1 disabled:opacity-50"
                                    >
                                      {expenseSubmitting ? (
                                        <Loader2 size={12} className="animate-spin" />
                                      ) : (
                                        <Check size={12} />
                                      )}
                                      Salvar
                                    </button>
                                    <button
                                      onClick={() => setEditingExpense(null)}
                                      className="px-3 py-1.5 bg-surface-2 text-text-secondary rounded-lg text-xs font-bold flex items-center gap-1"
                                    >
                                      <X size={12} /> Cancelar
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              {expensesMeta.totalPages > 1 && (
                <PaginationBar
                  meta={expensesMeta}
                  page={expensesPage}
                  loading={loading}
                  onPageChange={setExpensesPage}
                />
              )}
            </div>
          </div>
        )}

        {tab === 'fiado' && (
          <div className="space-y-4">
            <form
              onSubmit={handleFiadoSubmit(onCreateFiado)}
              className="bg-surface p-4 rounded-xl border border-border space-y-3"
            >
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Plus size={16} className="text-accent" /> Novo fiado
              </h3>
              <div className={FORM_GRID}>
                <Field label="Nome do cliente" error={fiadoErrors.customerName?.message}>
                  <input
                    type="text"
                    placeholder="Nome completo"
                    className={fiadoErrors.customerName ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                    {...registerFiado('customerName')}
                  />
                </Field>
                <Field label="WhatsApp" error={fiadoErrors.whatsapp?.message}>
                  <input
                    type="text"
                    placeholder="(00) 00000-0000"
                    className={fiadoErrors.whatsapp ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                    {...registerFiado('whatsapp')}
                  />
                </Field>
              </div>
              <Field label="Descrição" error={fiadoErrors.description?.message}>
                <input
                  type="text"
                  placeholder="Ex.: Corte + escova"
                  className={fiadoErrors.description ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                  {...registerFiado('description')}
                />
              </Field>
              <div className={FORM_GRID}>
                <Field label="Valor (R$)" error={fiadoErrors.amount?.message}>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0,00"
                    className={fiadoErrors.amount ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                    {...registerFiado('amount')}
                  />
                </Field>
                <Field label="Vencimento" error={fiadoErrors.dueDate?.message}>
                  <input type="date" className={FIELD_CONTROL} {...registerFiado('dueDate')} />
                </Field>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={fiadoSubmitting}
                  className="min-h-11 px-4 py-2 bg-accent text-accent-fg rounded-lg text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {fiadoSubmitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} />
                  )}
                  Registrar fiado
                </button>
              </div>
            </form>

            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex justify-between items-center bg-surface/50">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <CreditCard size={16} className="text-accent" /> Fiados
                </h3>
                <span className="text-xs text-text-muted">{fiadosMeta.total} registros</span>
              </div>
              <div className="max-h-[420px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-text-muted text-sm flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Carregando...
                  </div>
                ) : fiados.length === 0 ? (
                  <div className="p-8 text-center text-text-muted text-sm">
                    Nenhum fiado registrado.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-[980px] w-full text-left border-collapse">
                      <thead className="bg-bg text-text-muted text-[10px] uppercase tracking-wider sticky top-0">
                        <tr>
                          <th className="p-3 font-medium">Cliente</th>
                          <th className="p-3 font-medium">Descrição</th>
                          <th className="p-3 font-medium">Registrado em</th>
                          <th className="p-3 font-medium">Status</th>
                          <th className="p-3 font-medium text-right">Original</th>
                          <th className="p-3 font-medium text-right">Restante</th>
                          <th className="p-3 font-medium text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {fiados.map(item => (
                          <React.Fragment key={item.id}>
                            <tr className="text-xs text-text-secondary hover:bg-surface">
                              <td className="p-3">
                                <div className="font-medium text-text-primary">
                                  {item.customerName}
                                </div>
                                <div className="text-text-muted">{item.whatsapp}</div>
                              </td>
                              <td className="p-3">{item.description}</td>
                              <td className="p-3 whitespace-nowrap">
                                {formatDateTimeBR(item.createdAt)}
                              </td>
                              <td className="p-3">
                                <FiadoStatusBadge status={item.status} isOverdue={item.isOverdue} />
                              </td>
                              <td className="p-3 text-right">
                                {formatCurrencyBRL(item.originalAmount)}
                              </td>
                              <td className="p-3 text-right font-medium text-danger">
                                {formatCurrencyBRL(item.remainingAmount)}
                              </td>
                              <td className="p-3 text-center">
                                {(item.status === 'PENDING' || item.status === 'PARTIAL') && (
                                  <div className="flex justify-center gap-1.5">
                                    <button
                                      onClick={() => openChargeForm(item)}
                                      className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-warning/10 text-warning border border-warning/20 rounded-lg hover:bg-warning/20 transition-colors"
                                    >
                                      Cobrar
                                    </button>
                                    <button
                                      onClick={() => openPaymentForm(item)}
                                      className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20 rounded-lg hover:bg-accent/20 transition-colors"
                                    >
                                      Pagamento
                                    </button>
                                    <button
                                      onClick={() => setDeleteFiadoId(item.id)}
                                      title="Excluir fiado"
                                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-text-muted hover:bg-danger/10 hover:text-danger"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                            {paymentFiadoId === item.id && (
                              <tr className="bg-bg/60">
                                <td colSpan={7} className="p-3">
                                  <div className="flex flex-wrap items-end gap-3">
                                    <div>
                                      <label className="text-[10px] text-text-muted uppercase font-bold block mb-1">
                                        Valor do pagamento
                                      </label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={paymentAmount}
                                        onChange={e => setPaymentAmount(e.target.value)}
                                        className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary w-32 focus:outline-none focus:border-accent"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-[160px]">
                                      <label className="text-[10px] text-text-muted uppercase font-bold block mb-1">
                                        Observação (opcional)
                                      </label>
                                      <input
                                        type="text"
                                        value={paymentNotes}
                                        onChange={e => setPaymentNotes(e.target.value)}
                                        className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                                        placeholder="Ex: PIX recebido"
                                      />
                                    </div>
                                    <button
                                      onClick={() => handleAddPayment(item.id)}
                                      disabled={paymentSubmitting}
                                      className="px-3 py-2 bg-accent text-accent-fg rounded-lg text-xs font-bold flex items-center gap-1 disabled:opacity-50"
                                    >
                                      {paymentSubmitting ? (
                                        <Loader2 size={14} className="animate-spin" />
                                      ) : (
                                        <Check size={14} />
                                      )}
                                      Confirmar
                                    </button>
                                    <button
                                      onClick={() => setPaymentFiadoId(null)}
                                      className="px-3 py-2 bg-surface-2 text-text-secondary rounded-lg text-xs font-bold flex items-center gap-1"
                                    >
                                      <X size={14} /> Cancelar
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )}
                            {chargeFiadoId === item.id && (
                              <tr className="bg-warning/5">
                                <td colSpan={7} className="p-3">
                                  <div className="space-y-2">
                                    <p className="text-xs text-text-secondary">
                                      Será enviada uma lembrança curta e tranquila para{' '}
                                      {item.customerName} em {item.whatsapp}.
                                    </p>
                                    <div className="flex flex-wrap items-end gap-3">
                                      <div className="flex-1 min-w-[180px]">
                                        <label className="text-[10px] text-text-muted uppercase font-bold block mb-1">
                                          Chave PIX
                                        </label>
                                        <input
                                          type="text"
                                          value={chargePixKey}
                                          onChange={e => setChargePixKey(e.target.value)}
                                          placeholder="CPF, telefone, e-mail ou chave aleatória"
                                          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                                        />
                                      </div>
                                      <div className="flex-1 min-w-[220px]">
                                        <label className="text-[10px] text-text-muted uppercase font-bold block mb-1">
                                          Link para cartão
                                        </label>
                                        <input
                                          type="url"
                                          value={chargeCardLink}
                                          onChange={e => setChargeCardLink(e.target.value)}
                                          placeholder="https://..."
                                          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                                        />
                                      </div>
                                      <button
                                        onClick={() => handleChargeFiado(item.id)}
                                        disabled={chargeSubmitting}
                                        className="px-3 py-2 bg-accent text-accent-fg rounded-lg text-xs font-bold flex items-center gap-1 disabled:opacity-50"
                                      >
                                        {chargeSubmitting ? (
                                          <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                          <CreditCard size={14} />
                                        )}
                                        Enviar cobrança
                                      </button>
                                      <button
                                        onClick={() => setChargeFiadoId(null)}
                                        className="px-3 py-2 bg-surface-2 text-text-secondary rounded-lg text-xs font-bold"
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              {fiadosMeta.totalPages > 1 && (
                <PaginationBar
                  meta={fiadosMeta}
                  page={fiadosPage}
                  loading={loading}
                  onPageChange={setFiadosPage}
                />
              )}
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={!!deleteFiadoId}
        title="Excluir fiado?"
        message="Esse lançamento e seus pagamentos serão removidos permanentemente."
        confirmLabel="Excluir"
        variant="danger"
        loading={deleteFiadoLoading}
        onConfirm={() => void handleDeleteFiado()}
        onCancel={() => setDeleteFiadoId(null)}
      />
    </>
  );
};

const PaginationBar: React.FC<{
  meta: ListMeta;
  page: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}> = ({ meta, page, loading, onPageChange }) => (
  <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-bg/40">
    <span className="text-xs text-text-muted font-medium">
      {loading ? '...' : `${page}/${Math.max(1, meta.totalPages)}`}
    </span>
    <div className="flex items-center gap-2">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1 || loading}
        className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-text-secondary hover:bg-surface-2 disabled:opacity-30"
      >
        Anterior
      </button>
      <button
        onClick={() => onPageChange(Math.min(meta.totalPages, page + 1))}
        disabled={page >= meta.totalPages || loading}
        className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-text-secondary hover:bg-surface-2 disabled:opacity-30"
      >
        Próxima
      </button>
    </div>
  </div>
);
