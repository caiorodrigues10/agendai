import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Banknote,
  Check,
  CreditCard,
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
import { ApiError } from '../../infra/apiClient';
import {
  ExpenseItem,
  FiadoItem,
  FiadoStatus,
  financialApi,
  FinancialSummary,
  ListMeta,
} from '../../infra/financialApi';

type Tab = 'resumo' | 'despesas' | 'fiado';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString('pt-BR') : '—';

const errorMessage = (err: unknown): string =>
  err instanceof ApiError ? err.message : 'Erro inesperado. Tente novamente.';

const EMPTY_META: ListMeta = { total: 0, page: 1, limit: 20, totalPages: 1 };

const FIADO_STATUS: Record<FiadoStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pendente', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  PARTIAL: { label: 'Parcial', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  PAID: { label: 'Quitado', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  FORGIVEN: { label: 'Perdoado', className: 'bg-surface-2 text-text-muted border-border' },
};

const EXPENSE_TYPE_LABEL: Record<string, string> = {
  FIXED: 'Fixa',
  VARIABLE: 'Variável',
  INVESTMENT: 'Investimento',
};

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
  const [expensesMeta, setExpensesMeta] = useState<ListMeta>(EMPTY_META);
  const [expensesPage, setExpensesPage] = useState(1);

  const [fiados, setFiados] = useState<FiadoItem[]>([]);
  const [fiadosMeta, setFiadosMeta] = useState<ListMeta>(EMPTY_META);
  const [fiadosPage, setFiadosPage] = useState(1);

  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    type: 'VARIABLE' as 'FIXED' | 'VARIABLE',
    referenceDate: todayIso(),
  });
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);

  const [fiadoForm, setFiadoForm] = useState({
    customerName: '',
    whatsapp: '',
    description: '',
    amount: '',
  });
  const [fiadoSubmitting, setFiadoSubmitting] = useState(false);

  const [paymentFiadoId, setPaymentFiadoId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'resumo') {
        const data = await financialApi.getSummary();
        setSummary(data);
      } else if (tab === 'despesas') {
        const result = await financialApi.listExpenses({ page: expensesPage, limit: 20 });
        setExpenses(result.data);
        setExpensesMeta(result.meta ?? EMPTY_META);
      } else {
        const result = await financialApi.listFiados({ page: fiadosPage, limit: 20 });
        setFiados(result.data);
        setFiadosMeta(result.meta ?? EMPTY_META);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [tab, expensesPage, fiadosPage]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const handleRefresh = () => setRefreshKey(k => k + 1);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expenseForm.amount.replace(',', '.'));
    if (!expenseForm.title.trim() || !amount || amount <= 0) return;

    setExpenseSubmitting(true);
    setError(null);
    try {
      await financialApi.createExpense({
        title: expenseForm.title.trim(),
        amount,
        type: expenseForm.type,
        referenceDate: expenseForm.referenceDate,
      });
      setExpenseForm({ title: '', amount: '', type: 'VARIABLE', referenceDate: todayIso() });
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

  const handleCreateFiado = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(fiadoForm.amount.replace(',', '.'));
    if (!fiadoForm.customerName.trim() || !fiadoForm.whatsapp.trim() || !fiadoForm.description.trim() || !amount || amount <= 0) {
      return;
    }

    setFiadoSubmitting(true);
    setError(null);
    try {
      await financialApi.createFiado({
        customerName: fiadoForm.customerName.trim(),
        whatsapp: fiadoForm.whatsapp.trim(),
        description: fiadoForm.description.trim(),
        amount,
      });
      setFiadoForm({ customerName: '', whatsapp: '', description: '', amount: '' });
      handleRefresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setFiadoSubmitting(false);
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
    setPaymentFiadoId(fiado.id);
    setPaymentAmount(String(fiado.remainingAmount));
    setPaymentNotes('');
  };

  return (
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
                ${tab === t.id
                  ? 'bg-accent border-accent text-accent-fg'
                  : 'bg-bg border-border text-text-muted hover:border-border-strong'}
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
              <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Despesas</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <SummaryCard
                  icon={<TrendingDown size={48} />}
                  label="Total"
                  value={brl.format(summary.expenses.total)}
                  tone="negative"
                />
                <SummaryCard
                  icon={<Check size={48} />}
                  label="Pagas"
                  value={brl.format(summary.expenses.totalPaid)}
                  tone="positive"
                />
                <SummaryCard
                  icon={<Receipt size={48} />}
                  label="Pendentes"
                  value={brl.format(summary.expenses.totalPending)}
                />
                <SummaryCard
                  icon={<Receipt size={48} />}
                  label="Lançamentos"
                  value={String(summary.expenses.count)}
                  isCount
                />
              </div>

              <p className="text-xs text-text-muted uppercase font-bold tracking-wider pt-2">Fiado</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <SummaryCard
                  icon={<Users size={48} />}
                  label="Devedores"
                  value={String(summary.fiados.activeDebtors)}
                  isCount
                />
                <SummaryCard
                  icon={<CreditCard size={48} />}
                  label="Em aberto"
                  value={brl.format(summary.fiados.totalPending)}
                  tone="negative"
                />
                <SummaryCard
                  icon={<Wallet size={48} />}
                  label="Já recebido"
                  value={brl.format(summary.fiados.totalPaid)}
                  tone="positive"
                />
                <SummaryCard
                  icon={<AlertCircle size={48} />}
                  label="Vencidos"
                  value={brl.format(summary.fiados.overdueAmount)}
                  hint={`${summary.fiados.overdueCount} fiado(s)`}
                  tone="negative"
                />
              </div>

              {summary.expenses.byType.length > 0 && (
                <div className="bg-surface p-5 rounded-xl border border-border">
                  <h3 className="text-sm font-bold text-text-primary mb-4">Despesas por tipo</h3>
                  <div className="space-y-2">
                    {summary.expenses.byType.map(row => (
                      <div key={row.type} className="flex justify-between items-center text-sm">
                        <span className="text-text-secondary">
                          {EXPENSE_TYPE_LABEL[row.type] ?? row.type}
                          <span className="text-text-muted ml-2">({row.count})</span>
                        </span>
                        <span className="font-bold text-text-primary">{brl.format(row.total)}</span>
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
          <form
            onSubmit={handleCreateExpense}
            className="bg-surface p-4 rounded-xl border border-border space-y-3"
          >
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Plus size={16} className="text-accent" /> Nova despesa
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Título"
                value={expenseForm.title}
                onChange={e => setExpenseForm(f => ({ ...f, title: e.target.value }))}
                className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                required
              />
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Valor (R$)"
                value={expenseForm.amount}
                onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))}
                className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                required
              />
              <select
                value={expenseForm.type}
                onChange={e => setExpenseForm(f => ({ ...f, type: e.target.value as 'FIXED' | 'VARIABLE' }))}
                className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="VARIABLE">Variável</option>
                <option value="FIXED">Fixa</option>
              </select>
              <input
                type="date"
                value={expenseForm.referenceDate}
                onChange={e => setExpenseForm(f => ({ ...f, referenceDate: e.target.value }))}
                className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                required
              />
            </div>
            <button
              type="submit"
              disabled={expenseSubmitting}
              className="px-4 py-2 bg-accent text-accent-fg rounded-lg text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {expenseSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Adicionar
            </button>
          </form>

          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-surface/50">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Receipt size={16} className="text-accent" /> Despesas
              </h3>
              <span className="text-xs text-text-muted">{expensesMeta.total} registros</span>
            </div>
            <div className="max-h-[420px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-text-muted text-sm flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Carregando...
                </div>
              ) : expenses.length === 0 ? (
                <div className="p-8 text-center text-text-muted text-sm">Nenhuma despesa registrada.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-bg text-text-muted text-[10px] uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="p-3 font-medium">Data ref.</th>
                      <th className="p-3 font-medium">Título</th>
                      <th className="p-3 font-medium">Tipo</th>
                      <th className="p-3 font-medium text-right">Valor</th>
                      <th className="p-3 font-medium text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {expenses.map(item => (
                      <tr key={item.id} className="text-xs text-text-secondary hover:bg-surface">
                        <td className="p-3 whitespace-nowrap">{formatDate(item.referenceDate)}</td>
                        <td className="p-3">{item.title}</td>
                        <td className="p-3">{EXPENSE_TYPE_LABEL[item.type] ?? item.type}</td>
                        <td className="p-3 text-right text-danger font-medium">{brl.format(item.amount)}</td>
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
                            <button
                              onClick={() => setDeleteExpenseId(item.id)}
                              className="text-text-muted hover:text-danger"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
            onSubmit={handleCreateFiado}
            className="bg-surface p-4 rounded-xl border border-border space-y-3"
          >
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Plus size={16} className="text-accent" /> Novo fiado
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nome do cliente"
                value={fiadoForm.customerName}
                onChange={e => setFiadoForm(f => ({ ...f, customerName: e.target.value }))}
                className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                required
              />
              <input
                type="text"
                placeholder="WhatsApp"
                value={fiadoForm.whatsapp}
                onChange={e => setFiadoForm(f => ({ ...f, whatsapp: e.target.value }))}
                className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                required
              />
              <input
                type="text"
                placeholder="Descrição (ex: Corte + escova)"
                value={fiadoForm.description}
                onChange={e => setFiadoForm(f => ({ ...f, description: e.target.value }))}
                className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent sm:col-span-2"
                required
              />
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Valor (R$)"
                value={fiadoForm.amount}
                onChange={e => setFiadoForm(f => ({ ...f, amount: e.target.value }))}
                className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                required
              />
            </div>
            <button
              type="submit"
              disabled={fiadoSubmitting}
              className="px-4 py-2 bg-accent text-accent-fg rounded-lg text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {fiadoSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Registrar fiado
            </button>
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
                <div className="p-8 text-center text-text-muted text-sm">Nenhum fiado registrado.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-bg text-text-muted text-[10px] uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="p-3 font-medium">Cliente</th>
                      <th className="p-3 font-medium">Descrição</th>
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
                            <div className="font-medium text-text-primary">{item.customerName}</div>
                            <div className="text-text-muted">{item.whatsapp}</div>
                          </td>
                          <td className="p-3">{item.description}</td>
                          <td className="p-3">
                            <StatusBadge status={item.status} isOverdue={item.isOverdue} />
                          </td>
                          <td className="p-3 text-right">{brl.format(item.originalAmount)}</td>
                          <td className="p-3 text-right font-medium text-danger">
                            {brl.format(item.remainingAmount)}
                          </td>
                          <td className="p-3 text-center">
                            {(item.status === 'PENDING' || item.status === 'PARTIAL') && (
                              <button
                                onClick={() => openPaymentForm(item)}
                                className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20 rounded-lg hover:bg-accent/20 transition-colors"
                              >
                                Pagamento
                              </button>
                            )}
                          </td>
                        </tr>
                        {paymentFiadoId === item.id && (
                          <tr className="bg-bg/60">
                            <td colSpan={6} className="p-3">
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
                                  {paymentSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
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
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
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
  );
};

const SummaryCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: 'positive' | 'negative';
  isCount?: boolean;
}> = ({ icon, label, value, hint, tone, isCount }) => {
  const valueClass =
    tone === 'positive' ? 'text-success' : tone === 'negative' ? 'text-danger' : isCount ? 'text-text-primary' : 'text-accent';

  return (
    <div className="bg-surface p-3 rounded-xl border border-border shadow-lg relative overflow-hidden">
      <div className="absolute -right-2 -top-2 text-border opacity-20">{icon}</div>
      <p className="text-xs text-text-muted uppercase font-bold mb-1">{label}</p>
      <h3 className={`text-lg sm:text-xl font-bold truncate ${valueClass}`}>{value}</h3>
      {hint && <p className="text-[10px] text-text-muted mt-1">{hint}</p>}
    </div>
  );
};

const StatusBadge: React.FC<{ status: FiadoStatus; isOverdue?: boolean }> = ({ status, isOverdue }) => {
  const cfg = FIADO_STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${cfg.className}`}>
      {cfg.label}
      {isOverdue && status !== 'PAID' && status !== 'FORGIVEN' && (
        <span className="text-red-400 normal-case">· vencido</span>
      )}
    </span>
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
