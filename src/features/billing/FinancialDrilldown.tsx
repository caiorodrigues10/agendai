import React, { useCallback, useEffect, useState } from 'react';
import { LuDownload, LuRefreshCw, LuTriangleAlert } from 'react-icons/lu';
import { adminApi, FinancialBarbershopDetail } from '../../infra/adminApi';
import { ModalShell } from '../../components/patterns/ModalShell';
import { DataTableState } from '../../components/patterns/states/DataTableState';
import { getErrorMessage } from '../../utils/errorMessage';
import { brl, formatDate, formatDateTime } from './billingShared';

const SUBSCRIPTION_LABEL: Record<string, string> = {
  TRIALING: 'Em trial',
  ACTIVE: 'Ativa',
  PAST_DUE: 'Em atraso',
  PENDING: 'Pendente',
  CANCELED: 'Cancelada',
  UNPAID: 'Não paga',
};

const INVOICE_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente',
  PAID: 'Paga',
  OVERDUE: 'Vencida',
  CANCELLED: 'Cancelada',
};

const isoDay = (date: Date): string => date.toISOString().slice(0, 10);

const defaultPeriod = (): { from: string; to: string } => {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from: isoDay(from), to: isoDay(to) };
};

interface FinancialDrilldownProps {
  open: boolean;
  barbershopId: string | null;
  barbershopName?: string;
  onClose: () => void;
}

/**
 * Detalhe financeiro de um salão: assinatura, faturas, pagamentos,
 * reembolsos, despesas por tipo/categoria e fiados em aberto/vencidos.
 * Somente leitura (FINANCE_READ).
 */
export const FinancialDrilldown: React.FC<FinancialDrilldownProps> = ({
  open,
  barbershopId,
  barbershopName,
  onClose,
}) => {
  const [period, setPeriod] = useState(defaultPeriod);
  const [data, setData] = useState<FinancialBarbershopDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    if (!barbershopId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.getFinancialBarbershopDetail(barbershopId, {
        from: period.from,
        to: period.to,
      });
      setData(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [barbershopId, period.from, period.to]);

  useEffect(() => {
    if (!open) return;
    void load();
  }, [open, load]);

  const handleExport = async () => {
    if (!barbershopId) return;
    setExporting(true);
    setError(null);
    try {
      const res = await adminApi.exportBillingStatementCsv({
        barbershopId,
        from: period.from,
        to: period.to,
      });
      if (!res.ok) throw new Error('Falha no export');
      const blob = new Blob([await res.blob()], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `faturamento-${period.from}-${period.to}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Não foi possível exportar o extrato.');
    } finally {
      setExporting(false);
    }
  };

  const subscription = data?.barbershop.subscription ?? null;

  return (
    <ModalShell
      open={open}
      title={barbershopName ?? data?.barbershop.name ?? 'Detalhe financeiro'}
      titleId="financial-drilldown-title"
      variant="sheet"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="flex-1 min-h-11 rounded-xl border border-border font-bold text-text-secondary disabled:opacity-50"
          >
            <LuRefreshCw size={14} className="mr-1 inline" /> Atualizar
          </button>
          <button
            type="button"
            onClick={() => void handleExport()}
            disabled={exporting || !barbershopId}
            className="flex-1 min-h-11 rounded-xl bg-accent font-bold text-accent-fg disabled:opacity-50"
          >
            <LuDownload size={14} className="mr-1 inline" /> Exportar CSV
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="financial-from" className="block text-xs font-bold text-text-secondary mb-1">
              De
            </label>
            <input
              id="financial-from"
              type="date"
              value={period.from}
              onChange={(event) => setPeriod((current) => ({ ...current, from: event.target.value }))}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="financial-to" className="block text-xs font-bold text-text-secondary mb-1">
              Até
            </label>
            <input
              id="financial-to"
              type="date"
              value={period.to}
              onChange={(event) => setPeriod((current) => ({ ...current, to: event.target.value }))}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <DataTableState
          loading={loading && !data}
          error={error}
          onRetry={() => void load()}
        />

        {data && !loading && (
          <div className="space-y-4">
            <section className="rounded-xl border border-border p-3 space-y-2">
              <h3 className="text-sm font-bold">Assinatura</h3>
              {subscription ? (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-text-muted">Plano</span>
                    <span className="font-medium">{subscription.plan.name}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-text-muted">Status</span>
                    <span className="font-medium">
                      {SUBSCRIPTION_LABEL[subscription.status] ?? subscription.status}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-text-muted">Valor</span>
                    <span className="font-medium">{brl.format(subscription.plan.price)}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-text-muted">Termino</span>
                    <span className="font-medium">{formatDate(subscription.endDate)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-text-muted">Sem assinatura registrada.</p>
              )}
            </section>

            <section className="rounded-xl border border-border p-3 space-y-2">
              <h3 className="text-sm font-bold">Faturas</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                <div>
                  <p className="text-xs text-text-muted">Total</p>
                  <p className="font-bold">{data.invoices.summary.total}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Pagas</p>
                  <p className="font-bold text-success">{data.invoices.summary.paid}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Pendentes</p>
                  <p className="font-bold text-warning">{data.invoices.summary.pending}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Vencidas</p>
                  <p className="font-bold text-danger">{data.invoices.summary.overdue}</p>
                </div>
              </div>
              <p className="text-xs text-text-muted">
                Recebido: {brl.format(data.invoices.summary.sumPaid)} · Em atraso:{' '}
                {brl.format(data.invoices.summary.sumOverdue)}
              </p>
              {data.invoices.records.length > 0 && (
                <ul className="divide-y divide-border/50 text-sm">
                  {data.invoices.records.map((invoice) => (
                    <li key={invoice.id} className="flex items-center justify-between gap-2 py-1.5">
                      <span className="text-text-secondary">
                        {invoice.planName ?? 'Plano'} · venc. {formatDate(invoice.dueDate)}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-text-muted">
                          {INVOICE_STATUS_LABEL[invoice.status] ?? invoice.status}
                        </span>
                        <span className="font-medium">{brl.format(invoice.amount)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-xl border border-border p-3 grid grid-cols-2 gap-3">
              <div>
                <h3 className="text-sm font-bold">Pagamentos</h3>
                <p className="text-xs text-text-muted">{data.payments.count} no período</p>
                <p className="text-lg font-black">{brl.format(data.payments.total)}</p>
              </div>
              <div>
                <h3 className="text-sm font-bold">Reembolsos</h3>
                <p className="text-xs text-text-muted">{data.refunds.count} no período</p>
                <p className="text-lg font-black text-danger">{brl.format(data.refunds.total)}</p>
              </div>
            </section>

            <section className="rounded-xl border border-border p-3 space-y-2">
              <h3 className="text-sm font-bold">Despesas</h3>
              <p className="text-xs text-text-muted">
                Total {brl.format(data.expenses.summary.total)} · pagas{' '}
                {brl.format(data.expenses.summary.totalPaid)} · pendentes{' '}
                {brl.format(data.expenses.summary.totalPending)}
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-bold text-text-secondary mb-1">Por tipo</p>
                  {data.expenses.byType.length === 0 && (
                    <p className="text-xs text-text-muted">Sem despesas no período.</p>
                  )}
                  <ul className="space-y-1 text-sm">
                    {data.expenses.byType.map((item) => (
                      <li key={item.type} className="flex justify-between gap-2">
                        <span className="text-text-secondary">{item.type}</span>
                        <span className="font-medium">{brl.format(item.total)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-secondary mb-1">Por categoria</p>
                  {data.expenses.byCategory.length === 0 && (
                    <p className="text-xs text-text-muted">Sem despesas no período.</p>
                  )}
                  <ul className="space-y-1 text-sm">
                    {data.expenses.byCategory.map((item) => (
                      <li key={item.category} className="flex justify-between gap-2">
                        <span className="text-text-secondary">{item.category}</span>
                        <span className="font-medium">{brl.format(item.total)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-border p-3 space-y-2">
              <h3 className="text-sm font-bold">Fiados em aberto</h3>
              <p className="text-xs text-text-muted">
                {data.fiados.summary.activeDebtors} devedor(es) · {brl.format(data.fiados.summary.totalDebt)}{' '}
                pendente · {data.fiados.summary.overdueCount} vencido(s) (
                {brl.format(data.fiados.summary.overdueAmount)})
              </p>
              {data.fiados.records.length === 0 ? (
                <p className="text-sm text-text-muted">Nenhum fiado em aberto.</p>
              ) : (
                <ul className="divide-y divide-border/50 text-sm">
                  {data.fiados.records.map((fiado) => (
                    <li key={fiado.id} className="flex items-center justify-between gap-2 py-1.5">
                      <span className="text-text-secondary">
                        {fiado.customerName}
                        {fiado.isOverdue && (
                          <span className="ml-2 text-xs font-bold text-danger">vencido</span>
                        )}
                      </span>
                      <span className="font-medium">{brl.format(fiado.remainingAmount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <p className="text-xs text-text-muted">
              Última atualização: {formatDateTime(new Date().toISOString())}
            </p>
          </div>
        )}

        {error && (
          <p role="alert" className="flex items-center gap-2 text-sm text-danger">
            <LuTriangleAlert size={14} /> {error}
          </p>
        )}
      </div>
    </ModalShell>
  );
};

export default FinancialDrilldown;
