import { useCategories } from '../../hooks/useCategories';
import { CategoryManager } from './CategoryManager';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  LuCircleAlert as AlertCircle,
  LuBanknote as Banknote,
  LuCheck as Check,
  LuCircleCheck as CheckCircle,
  LuCreditCard as CreditCard,
  LuDownload as Download,
  LuPencilLine as Edit3,
  LuFilter as Filter,
  LuLoaderCircle as Loader2,
  LuPlus as Plus,
  LuReceipt as Receipt,
  LuRefreshCcw as RefreshCcw,
  LuTrash2 as Trash2,
  LuTrendingDown as TrendingDown,
  LuUsers as Users,
  LuWallet as Wallet,
  LuX as X,
} from 'react-icons/lu';
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
import { cashApi, CashSummary } from '../../infra/cashApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { usePermissions } from '../../hooks/usePermissions';
import { ExpenseSchema, ExpenseFormData, FiadoSchema, FiadoFormData } from '../../schemas';
import { formatCurrencyBRL, formatDateBR, formatDateTimeBR } from '../../utils/formatters';
import {
  EXPENSE_RECURRENCE_LABELS,
  EXPENSE_TYPE_LABELS,
  FINANCE_PAYMENT_METHODS,
  FiadoStatusBadge,
  FinanceSummaryCard,
} from '../../features/finance';
import { FinanceResumoSkeleton } from './skeletons/FinanceResumoSkeleton';
import { Skeleton, SkeletonRegion } from '../ui/Skeleton';

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

  const { barbershopId } = useBarbershopFilters();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('FINANCE_CREATE') || hasPermission('FINANCE_MANAGE');
  const [cashSummary, setCashSummary] = useState<CashSummary | null>(null);
  const [cashLoading, setCashLoading] = useState(true);

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

  useEffect(() => {
    if (tab !== 'resumo' || !barbershopId) return;
    setCashLoading(true);
    cashApi.getSummary(barbershopId, todayIso())
      .then(setCashSummary)
      .catch(() => setCashSummary(null))
      .finally(() => setCashLoading(false));
  }, [tab, barbershopId, refreshKey]);

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
    setError(null);
    financialApi
      .exportExpensesCsv(Object.keys(params).length ? params : undefined)
      .catch(err => setError(errorMessage(err)));
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
              <Banknote size={24} className="text-accent" /> Financeiro
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
              <FinanceResumoSkeleton />
            ) : summary ? (
              <>
                {/* ── Priority indicators ── */}
                <SkeletonRegion loading={loading} label="Atualizando resumo">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <FinanceSummaryCard
                      icon={<Receipt size={20} />}
                      label="Despesas pendentes"
                      value={formatCurrencyBRL(summary.expenses.totalPending)}
                      hint={`${summary.expenses.count} lançamento(s) no total`}
                    />
                    <FinanceSummaryCard
                      icon={<CreditCard size={20} />}
                      label="Fiado em aberto"
                      value={formatCurrencyBRL(summary.fiados.totalPending)}
                      hint={`${summary.fiados.activeDebtors} devedor(es)`}
                      tone="negative"
                    />
                    <FinanceSummaryCard
                      icon={<AlertCircle size={20} />}
                      label="Fiado vencido"
                      value={formatCurrencyBRL(summary.fiados.overdueAmount)}
                      hint={summary.fiados.overdueCount > 0 ? `${summary.fiados.overdueCount} fiado(s) vencido(s)` : undefined}
                      tone={summary.fiados.overdueCount > 0 ? 'negative' : undefined}
                    />
                    <FinanceSummaryCard
                      icon={<Check size={20} />}
                      label="Despesas pagas"
                      value={formatCurrencyBRL(summary.expenses.totalPaid)}
                      tone="positive"
                    />
                  </div>
                </SkeletonRegion>

                {/* ── Caixa do dia ── */}
                <SkeletonRegion loading={cashLoading} label="Carregando caixa do dia">
                  <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Caixa do dia</p>
                      {canCreate && (
                        <span className="text-[10px] text-accent font-bold">Registrar movimentação</span>
                      )}
                    </div>
                    {cashLoading ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-bg/60 p-3"><Skeleton width="50%" height="1rem" /><Skeleton width="70%" height="1.25rem" className="mt-1" /></div>
                        <div className="rounded-lg bg-bg/60 p-3"><Skeleton width="50%" height="1rem" /><Skeleton width="70%" height="1.25rem" className="mt-1" /></div>
                      </div>
                    ) : cashSummary ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-bg/60 p-3">
                          <p className="text-[10px] font-bold uppercase text-text-muted">Total recebido</p>
                          <p className="text-lg font-bold text-text-primary">{formatCurrencyBRL(cashSummary.total ?? 0)}</p>
                        </div>
                        <div className="rounded-lg bg-bg/60 p-3">
                          <p className="text-[10px] font-bold uppercase text-text-muted">Movimentações</p>
                          <p className="text-lg font-bold text-text-primary">{Object.values(cashSummary.byMethod ?? {}).reduce((s, m) => s + (m.count ?? 0), 0)}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-text-muted">Sem dados de caixa para hoje.</p>
                    )}
                  </div>
                </SkeletonRegion>

                {/* ── Detail blocks ── */}
                <SkeletonRegion loading={loading} label="Carregando detalhes">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Despesas */}
                    <div className="rounded-xl border border-border bg-surface p-4 space-y-2">
                      <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Despesas</p>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Total</span>
                          <span className="font-bold text-text-primary">{formatCurrencyBRL(summary.expenses.total)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Pagas</span>
                          <span className="font-bold text-success">{formatCurrencyBRL(summary.expenses.totalPaid)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Pendentes</span>
                          <span className="font-bold text-text-primary">{formatCurrencyBRL(summary.expenses.totalPending)}</span>
                        </div>
                        {Array.isArray(summary.expenses.byType) && summary.expenses.byType.length > 0 && (
                          <div className="pt-1.5 mt-1.5 border-t border-border">
                            {summary.expenses.byType.map(row => (
                              <div key={row.type} className="flex justify-between text-xs">
                                <span className="text-text-muted">{EXPENSE_TYPE_LABELS[row.type] ?? row.type} ({row.count})</span>
                                <span className="text-text-secondary">{formatCurrencyBRL(row.total)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recebimentos de fiado */}
                    <div className="rounded-xl border border-border bg-surface p-4 space-y-2">
                      <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Recebimentos de fiado</p>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Em aberto</span>
                          <span className="font-bold text-danger">{formatCurrencyBRL(summary.fiados.totalPending)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Já recebido</span>
                          <span className="font-bold text-success">{formatCurrencyBRL(summary.fiados.totalPaid)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Devedores</span>
                          <span className="font-bold text-text-primary">{summary.fiados.activeDebtors}</span>
                        </div>
                        {summary.fiados.overdueCount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Vencidos</span>
                            <span className="font-bold text-danger">{summary.fiados.overdueCount}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Vendas de produtos e pacotes */}
                    {(summary.products || summary.packages) && (
                      <div className="rounded-xl border border-border bg-surface p-4 space-y-2">
                        <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Vendas de produtos e pacotes</p>
                        <div className="space-y-1.5 text-sm">
                          {summary.products && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-text-secondary">Receita de produtos</span>
                                <span className="font-bold text-text-primary">{formatCurrencyBRL(summary.products.netRevenue ?? summary.products.revenue)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-text-secondary">Custo dos produtos vendidos</span>
                                <span className="font-bold text-text-primary">{formatCurrencyBRL(summary.products.cogs)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-text-secondary">Margem bruta</span>
                                <span className="font-bold text-success">{formatCurrencyBRL(summary.products.margin)}</span>
                              </div>
                              {summary.products.refunded > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-text-secondary">Estornos</span>
                                  <span className="font-bold text-danger">{formatCurrencyBRL(summary.products.refunded)}</span>
                                </div>
                              )}
                            </>
                          )}
                          {summary.packages && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-text-secondary">Pacotes vendidos</span>
                                <span className="font-bold text-text-primary">{summary.packages.count}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-text-secondary">Recebido de pacotes</span>
                                <span className="font-bold text-success">{formatCurrencyBRL(summary.packages.totalPaid)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </SkeletonRegion>

                {/* ── Estoque (compact) ── */}
                {summary.products && (
                  <SkeletonRegion loading={loading} label="Carregando estoque">
                    <div className="rounded-xl border border-border bg-surface p-4 space-y-2">
                      <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Estoque</p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-text-secondary">Valor em estoque:</span>
                          <span className="font-bold text-text-primary">{formatCurrencyBRL(summary.products.inventoryValue)}</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-text-secondary">Compras:</span>
                          <span className="font-bold text-text-primary">{formatCurrencyBRL(summary.products.stockPurchases)}</span>
                        </div>
                        {summary.products.lowStockCount > 0 && (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-text-secondary">Abaixo do mínimo:</span>
                            <span className="font-bold text-danger">{summary.products.lowStockCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </SkeletonRegion>
                )}

                {loading && summary && (
                  <p className="text-xs text-text-muted text-center">Atualizando…</p>
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
                  <div className="p-4 space-y-2" aria-label="Carregando despesas">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-bg p-3">
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 w-1/3 rounded bg-surface-2" />
                          <div className="h-2.5 w-1/5 rounded bg-surface-2" />
                        </div>
                        <div className="h-4 w-20 rounded bg-surface-2" />
                      </div>
                    ))}
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
                  <div className="p-4 space-y-2" aria-label="Carregando fiados">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-bg p-3">
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 w-1/4 rounded bg-surface-2" />
                          <div className="h-2.5 w-1/3 rounded bg-surface-2" />
                        </div>
                        <div className="h-4 w-16 rounded bg-surface-2" />
                      </div>
                    ))}
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
