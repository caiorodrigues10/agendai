import React, { useCallback, useEffect, useState } from 'react';
import { LuBan as Ban, LuCheck as Check, LuClock as Clock, LuWallet as Wallet } from 'react-icons/lu';
import { casesApi, type CaseFeesReport, type CaseFeesReportSummary } from '../../infra/casesApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { formatCurrency, formatDate } from './caseLabels';
import { SUCCESS_FEE_STATUS_LABELS } from './CaseBillingTab';

const EMPTY_SUMMARY: CaseFeesReportSummary = {
  totalAmount: 0,
  totalCount: 0,
  pendingAmount: 0,
  pendingCount: 0,
  invoicedAmount: 0,
  invoicedCount: 0,
  paidAmount: 0,
  paidCount: 0,
  canceledAmount: 0,
  canceledCount: 0,
  receivableAmount: 0,
};

export const CaseFeesReportPanel: React.FC = () => {
  const [report, setReport] = useState<CaseFeesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReport(await casesApi.successFeesReport());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial do relatório
    void load();
  }, [load]);

  if (loading) {
    return (
      <p className="rounded-xl border border-border bg-surface px-3 py-6 text-center text-xs text-text-muted">
        Carregando honorários…
      </p>
    );
  }

  if (error) {
    return (
      <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger">
        {error}
      </p>
    );
  }

  const summary = report?.summary ?? EMPTY_SUMMARY;
  const rows = report?.rows ?? [];

  return (
    <section aria-label="Relatório de honorários" className="space-y-4">
      <header>
        <h3 className="font-display text-sm font-bold text-text-primary">Honorários</h3>
        <p className="text-xs text-text-muted">
          Honorários de êxito por situação. Este relatório não entra no caixa nem nas receitas.
        </p>
        <p className="text-[11px] text-text-muted">
          Honorários com mais de 1 parcela aparecem como “sem parcelas reais”; o valor ainda é
          tratado como parcela única.
        </p>
      </header>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={<Clock size={15} />}
          label="A receber"
          value={summary.receivableAmount}
          detail={`${summary.pendingCount + summary.invoicedCount} honorário(s)`}
        />
        <SummaryCard
          icon={<Check size={15} />}
          label="Recebido"
          value={summary.paidAmount}
          detail={`${summary.paidCount} honorário(s)`}
        />
        <SummaryCard
          icon={<Ban size={15} />}
          label="Cancelado"
          value={summary.canceledAmount}
          detail={`${summary.canceledCount} honorário(s)`}
        />
        <SummaryCard
          icon={<Wallet size={15} />}
          label="Total"
          value={summary.totalAmount}
          detail={`${summary.totalCount} honorário(s)`}
        />
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface px-3 py-6 text-center text-xs text-text-muted">
          Nenhum honorário de êxito registrado.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[46rem] text-left text-xs">
            <thead className="bg-surface text-[10px] uppercase tracking-wider text-text-muted">
              <tr>
                <th className="px-3 py-2 font-bold">Processo</th>
                <th className="px-3 py-2 font-bold">Cliente</th>
                <th className="px-3 py-2 text-right font-bold">Percentual</th>
                <th className="px-3 py-2 text-right font-bold">Valor</th>
                <th className="px-3 py-2 font-bold">Parcelas</th>
                <th className="px-3 py-2 font-bold">Situação</th>
                <th className="px-3 py-2 font-bold">Vencimento</th>
                <th className="px-3 py-2 font-bold">Recebido em</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(fee => (
                <tr key={fee.id} className="border-t border-border">
                  <td className="px-3 py-2">
                    <p className="font-bold text-text-primary">{fee.caseName ?? 'Processo'}</p>
                    <p className="text-[11px] text-text-muted">{fee.caseNumber ?? 'Sem número'}</p>
                  </td>
                  <td className="px-3 py-2 text-text-secondary">{fee.clientName ?? '—'}</td>
                  <td className="px-3 py-2 text-right text-text-secondary">{fee.percent}%</td>
                  <td className="px-3 py-2 text-right font-bold text-text-primary">
                    {formatCurrency(fee.amount)}
                  </td>
                  <td className="px-3 py-2 text-text-secondary">
                    {fee.installments > 1
                      ? `${fee.installments}x — sem parcelas reais`
                      : "1x"}
                  </td>
                  <td className="px-3 py-2 text-text-secondary">
                    {SUCCESS_FEE_STATUS_LABELS[fee.status]}
                  </td>
                  <td className="px-3 py-2 text-text-secondary">{formatDate(fee.dueDate)}</td>
                  <td className="px-3 py-2 text-text-secondary">{formatDate(fee.paidAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  detail: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, label, value, detail }) => (
  <div className="rounded-xl border border-border bg-surface px-3 py-3">
    <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
      {icon} {label}
    </p>
    <p className="mt-1 font-display text-lg font-bold text-text-primary">{formatCurrency(value)}</p>
    <p className="text-[11px] text-text-muted">{detail}</p>
  </div>
);
